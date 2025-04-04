import { PrismaClient, UserRole, FocusGroup } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Define the admin credentials from the setup route
const ADMIN_EMAIL = 'OWPulsar@admin.local';
const ADMIN_PASSWORD = '!LightBendsAroundMe123';
const ADMIN_NAME = 'OWPulsar Admin';
const SEED_USER_EMAIL = 'seed@system.local'; // Email for the seed user
const SEED_DATA_REGION = 'SEED_DATA'; // Default region for seeded data


// --- Helper Functions ---

// Function to safely parse CSV strings from cells
const parseCsvString = (cellValue: string | undefined | null): string[] => {
  if (!cellValue || typeof cellValue !== 'string') {
    return [];
  }
  // Trim whitespace and filter empty strings after split
  return cellValue.split(',').map(s => s.trim()).filter(Boolean);
};

// Helper to get random date in the last N months
function getRandomDateLastNMonths(months: number): Date {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - months);
    const start = pastDate.getTime();
    const end = today.getTime();
    return new Date(start + Math.random() * (end - start));
}

// Helper to get random int between min/max (inclusive)
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get random element from array
function getRandomElement<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get N random unique elements from array
function getRandomElements<T>(arr: T[], count: number): T[] {
    if (arr.length === 0 || count <= 0) return [];
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
}

// --- Main Seeding Logic ---
async function main() {
  console.log(`[SEED] Starting seed script execution...`);

  // 1. Seed Admin User
  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existingAdmin) {
    console.log(`[SEED] Admin user ${ADMIN_EMAIL} already exists. Skipping admin creation.`);
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    await prisma.user.create({
      data: { email: ADMIN_EMAIL, name: ADMIN_NAME, passwordHash: hashedPassword, role: UserRole.ADMIN },
    });
    console.log(`[SEED] Admin user ${ADMIN_EMAIL} created successfully.`);
  }

  // 2. Create or find the Seed Anonymous User
  console.log(`[SEED] Upserting seed anonymous user (${SEED_USER_EMAIL})...`);
  const seedUser = await prisma.anonymousUser.upsert({
      where: { email: SEED_USER_EMAIL },
      update: {},
      create: { email: SEED_USER_EMAIL, region: SEED_DATA_REGION },
      select: { id: true },
  });
  console.log(`[SEED] Using Seed Anonymous User ID: ${seedUser.id}`);

  // 3. Define and Ensure Target Focus Groups Exist
  const targetFocusGroupNames = ["Operations", "Sales", "IT", "Business"];
  const focusGroups: { id: string; name: string }[] = [];
  console.log(`[SEED] Ensuring target focus groups exist: ${targetFocusGroupNames.join(', ')}`);
  for (const name of targetFocusGroupNames) {
      const group = await prisma.focusGroup.upsert({
          where: { name },
          update: {},
          create: { name },
          select: { id: true, name: true },
      });
      focusGroups.push(group);
      console.log(`[SEED] Using Focus Group: ${group.name} (ID: ${group.id})`);
  }
  const focusGroupIds = focusGroups.map(fg => fg.id);
  const itGroupId = focusGroups.find(fg => fg.name === "IT")?.id;

  // 4. Seed Data from Excel (Randomly Assigning to Target Groups)
  const excelFilePath = path.resolve(process.cwd(), '20241111_OW Balance Report.xlsx');
  console.log(`[SEED] Checking for Excel file at: ${excelFilePath}`);
  if (!fs.existsSync(excelFilePath)) {
    console.warn(`[SEED] WARNING: Excel file not found. Skipping Excel data seeding.`);
  } else {
    console.log(`[SEED] Reading Excel file...`);
    const workbook = XLSX.readFile(excelFilePath);
    let excelSubmissionsCreated = 0;
    let excelSubmissionsSkipped = 0;

    for (const sheetName of workbook.SheetNames) {
      if (sheetName.toLowerCase().includes('summary') || sheetName.toLowerCase().includes('readme')) {
          console.log(`[SEED] Skipping sheet: ${sheetName}`);
          continue;
      }
      console.log(`\n[SEED] Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      console.log(`[SEED] Sheet '${sheetName}': Found ${data.length} rows.`);

      if (data.length === 0) continue;

      for (const [index, row] of data.entries()) {
        const submissionStatus = row['Submission Status'] || row['Submission status'];
        const hours = row['Hours'];
        const satisfactionRating = row['Satifaction Rating'] || row['Satisfaction Rating'];
        const brightSpotsRaw = row['Bright Spots'];
        const challengesRaw = row['Challenges'];
        const commentsPositive = row['comments positive'] || row['Comments Positive'];
        const commentsNegative = row['comments negative'] || row['Comments Negative'];

        const submitted = ['Submitted', 'Complete', 'Done'].includes(submissionStatus);
        if (!submitted) {
            excelSubmissionsSkipped++;
            continue;
        }

        const mood = typeof satisfactionRating === 'number' ? Math.max(1, Math.min(5, Math.round(satisfactionRating))) : null;
        if (mood === null) {
            console.warn(`[SEED] Skipping Excel row ${index + 2} in ${sheetName} due to invalid/missing satisfaction rating: ${satisfactionRating}`);
            excelSubmissionsSkipped++;
            continue;
        }

        const hoursWorked = typeof hours === 'number' ? hours : null;
        const randomFocusGroupId = getRandomElement(focusGroupIds);

        if (!randomFocusGroupId) {
            console.error("[SEED] CRITICAL: Could not get random focus group ID during Excel processing.");
            excelSubmissionsSkipped++;
            continue;
        }

        try {
            const positiveAspectNames = parseCsvString(brightSpotsRaw);
            const negativeAspectNames = parseCsvString(challengesRaw);

            await prisma.submission.create({
                data: {
                    anonymousUserId: seedUser.id,
                    region: SEED_DATA_REGION,
                    focusGroupId: randomFocusGroupId, // Assign randomly
                    overallMood: mood,
                    hoursWorked: hoursWorked,
                    comment: [commentsPositive, commentsNegative].filter(Boolean).map(c => String(c).trim()).join('\n\n---\n\n') || null,
                    positiveAspects: positiveAspectNames,
                    negativeAspects: negativeAspectNames,
                    // Generate a plausible past timestamp if not present in Excel
                    timestamp: getRandomDateLastNMonths(4), // Spread Excel data over last 4 months too
                    createdAt: getRandomDateLastNMonths(4),
                },
            });
            excelSubmissionsCreated++;
        } catch (submissionError: any) {
            console.error(`[SEED] Error creating submission for Excel row ${index + 2} in sheet ${sheetName}:`, submissionError.message);
            excelSubmissionsSkipped++;
        }
      }
    }
    console.log(`[SEED] Finished processing Excel: ${excelSubmissionsCreated} submissions created, ${excelSubmissionsSkipped} rows skipped.`);
  }

  // 5. Generate Additional Randomized Submissions
  console.log("\n[SEED] Starting generation of 9000 randomized submissions...");

  if (focusGroupIds.length === 0) {
      console.error("[SEED] CRITICAL: No focus groups exist. Cannot generate randomized submissions.");
  } else {
      const NUM_SUBMISSIONS_TO_GENERATE = 9000;
      const MONTHS_BACK = 3;
      const submissionsToCreate = [];

      const samplePositiveAspects = ["Good Collaboration", "Achieved Goals", "Interesting Work", "Flexibility", "Team Culture", "Recognition", "Learning"];
      const sampleNegativeAspects = ["High Workload", "Meeting Fatigue", "Unclear Expectations", "Communication Issues", "Lack of Feedback", "Work-Life Balance"];

      for (let i = 0; i < NUM_SUBMISSIONS_TO_GENERATE; i++) {
          const randomTimestamp = getRandomDateLastNMonths(MONTHS_BACK);
          const randomFocusGroupId = getRandomElement(focusGroupIds)!; // Assert non-null as we checked length

          // Skew mood based on group
          let randomMood: number;
          if (randomFocusGroupId === itGroupId) {
              // Make IT group more miserable (higher chance of 1-3)
              const moodRoll = Math.random();
              if (moodRoll < 0.4) randomMood = getRandomInt(1, 2); // 40% chance 1-2
              else if (moodRoll < 0.75) randomMood = 3; // 35% chance 3
              else randomMood = getRandomInt(4, 5); // 25% chance 4-5
          } else {
              // Other groups skew positive
              const moodRoll = Math.random();
              if (moodRoll < 0.1) randomMood = getRandomInt(1, 2); // 10% chance 1-2
              else if (moodRoll < 0.3) randomMood = 3; // 20% chance 3
              else randomMood = getRandomInt(4, 5); // 70% chance 4-5
          }


          const randomHours = getRandomInt(30, 55);
          const numPositive = getRandomInt(1, 3);
          const numNegative = getRandomInt(0, 2);
          const positiveAspects = getRandomElements(samplePositiveAspects, numPositive);
          const negativeAspects = getRandomElements(sampleNegativeAspects, numNegative);
          const addComment = Math.random() < 0.1;

          submissionsToCreate.push({
              anonymousUserId: seedUser.id,
              region: SEED_DATA_REGION,
              focusGroupId: randomFocusGroupId,
              overallMood: randomMood,
              hoursWorked: randomHours,
              comment: addComment ? `Generated comment for submission ${i + 1}.` : null,
              positiveAspects: positiveAspects,
              negativeAspects: negativeAspects,
              didNotWork: false,
              timestamp: randomTimestamp,
              createdAt: randomTimestamp,
          });
      }

      try {
          console.log(`[SEED] Attempting to create ${submissionsToCreate.length} randomized submissions in batches...`);
          const batchSize = 500;
          let totalCreated = 0;
          for (let i = 0; i < submissionsToCreate.length; i += batchSize) {
              const batch = submissionsToCreate.slice(i, i + batchSize);
              const result = await prisma.submission.createMany({
                  data: batch,
                  skipDuplicates: true,
              });
              console.log(`[SEED] Created batch ${i / batchSize + 1}: ${result.count} submissions.`);
              totalCreated += result.count;
          }
          console.log(`[SEED] Finished creating randomized submissions. Total created: ${totalCreated}`);
      } catch (error: any) {
          console.error("[SEED] Error creating randomized submissions:", error.message);
      }
  }


  console.log(`\n[SEED] Seeding finished.`);
}

main()
  .catch((e) => {
    console.error("[SEED] Seeding script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });