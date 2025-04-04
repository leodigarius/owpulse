import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path
import Papa from 'papaparse'; // CSV parser
import { Readable } from 'stream'; // To handle file stream

// Helper to check for Admin role
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions); 
  return !!session?.user && session.user.role === 'ADMIN'; 
}

// Helper function to parse CSV stream
function parseCsvStream(stream: Readable): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(stream, {
            header: true, // Assume first row is header
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error('CSV Parsing errors:', results.errors);
                    // Decide if partial data is acceptable or reject entirely
                    // For now, reject on any parsing error
                    reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
                } else {
                    resolve(results.data);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

// POST handler for file upload - Rewritten try...catch block
export async function POST(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('dataUpload') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    let parsedData: any[] = [];

    // --- Parse File ---
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const stream = Readable.fromWeb(file.stream() as any);
        parsedData = await parseCsvStream(stream);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const fileContent = await file.text();
        parsedData = JSON.parse(fileContent);
        if (!Array.isArray(parsedData)) {
             throw new Error('JSON file must contain an array of submission objects.');
        }
    } else {
        return NextResponse.json({ message: 'Unsupported file type. Please upload CSV or JSON.' }, { status: 400 });
    }

    if (parsedData.length === 0) {
         return NextResponse.json({ message: 'No valid data found in the file.' }, { status: 400 });
    }

    console.log(`Parsed ${parsedData.length} records from file.`);
    
    const submissionsToCreate: any[] = [];
    const errors: string[] = [];

    // --- Validate and Transform Data ---
    // Using Promise.all to handle async lookups within the loop efficiently
    await Promise.all(parsedData.map(async (record) => {
        // Example validation/transformation (ADAPT TO YOUR FILE FORMAT)
        const focusGroupName = record['Focus Group'] || record['focusGroup'];
        const mood = parseInt(record['Mood'] || record['overallMood'], 10);
        let focusGroupId: string | undefined;

        // Find focus group ID (consider caching this lookup)
        if (focusGroupName) {
             // @ts-ignore - Ignoring Prisma type error for now
             const group = await prisma.focusGroup.findUnique({ where: { name: focusGroupName } });
             focusGroupId = group?.id;
        } else {
            errors.push(`Missing Focus Group for record: ${JSON.stringify(record)}`);
            return; // Skip record if group name is missing
        }

        if (!focusGroupId) {
            errors.push(`Focus Group '${focusGroupName}' not found for record: ${JSON.stringify(record)}`);
            return; // Skip record if group doesn't exist
        }
        
        // Validate mood only if didNotWork is false or not present
        const didNotWork = record['Did Not Work']?.toLowerCase() === 'true' || false;
        if (!didNotWork && (isNaN(mood) || mood < 1 || mood > 5)) {
             errors.push(`Invalid Mood value for record: ${JSON.stringify(record)}`);
             return; // Skip record
        }
        
        // Validate hours only if didNotWork is false or not present
        const hoursWorkedRaw = record['Hours Worked'];
        const hoursWorked = !didNotWork && hoursWorkedRaw ? parseInt(hoursWorkedRaw, 10) : null;
        if (!didNotWork && hoursWorked === null && hoursWorkedRaw !== undefined && hoursWorkedRaw !== '') { // Check if parsing failed but value was present
             errors.push(`Invalid Hours Worked value for record: ${JSON.stringify(record)}`);
             return; // Skip record
        }
        if (!didNotWork && hoursWorked !== null && hoursWorked < 0) {
             errors.push(`Invalid Hours Worked value (must be >= 0) for record: ${JSON.stringify(record)}`);
             return; // Skip record
        }

        // Handle Anonymous User (Placeholder - needs proper logic)
        const anonymousUserId = record['UserID'] || crypto.randomUUID();
        // @ts-ignore - Ignoring Prisma type error for now
        await prisma.anonymousUser.upsert({
             where: { id: anonymousUserId },
             create: { id: anonymousUserId, region: record['Region'] || 'UPLOADED' },
             update: {},
        });

        // Prepare data for Prisma createMany
        submissionsToCreate.push({
            anonymousUserId: anonymousUserId,
            focusGroupId: focusGroupId, // Field name matches schema
            timestamp: record['Timestamp'] ? new Date(record['Timestamp']) : new Date(),
            overallMood: !didNotWork ? mood : null, // Nullify if didn't work
            positiveAspects: record['Positive Aspects']?.split(',').map((s:string)=>s.trim()).filter(Boolean) || [], // Trim and filter empty strings
            negativeAspects: record['Negative Aspects']?.split(',').map((s:string)=>s.trim()).filter(Boolean) || [], // Trim and filter empty strings
            hoursWorked: hoursWorked, // Use validated/parsed value
            didNotWork: didNotWork,
            comment: record['Comment'] || null,
            region: record['Region'] || 'UPLOADED',
        });
    })); // End Promise.all map

    // --- Handle Validation Errors ---
    if (errors.length > 0) {
        console.warn(`Data validation errors found: ${errors.length} records skipped.`);
        // Decide if we should proceed with partial insert or fail completely
        // For now, let's proceed with valid records
    }
    
    if (submissionsToCreate.length === 0) {
         return NextResponse.json({ message: 'No valid submissions could be created from the file after validation.', errors }, { status: 400 });
    }

    // --- Insert Data ---
    console.log(`Attempting to insert ${submissionsToCreate.length} valid submissions...`);
    // @ts-ignore - Ignoring Prisma type error for now
    const result = await prisma.submission.createMany({
      data: submissionsToCreate,
      skipDuplicates: true,
    });

    console.log(`Successfully inserted ${result.count} submissions.`);

    // TODO: Add Action Log entry for the upload event

    return NextResponse.json({
        message: `Data upload successful. ${result.count} submissions created. ${errors.length} records skipped due to validation errors.`,
        insertedCount: result.count,
        skippedCount: errors.length,
        validationErrors: errors
    }, { status: 201 });

  } catch (error: any) { // Catch block for the whole POST handler
    console.error('Data Upload API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error during data upload', error: error.message }, { status: 500 });
  } // End catch block
} // End POST handler