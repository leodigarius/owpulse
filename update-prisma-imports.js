// Helper script to update all imports in API routes
module.exports = {
  name: 'update-prisma-imports',
  description: 'Updates Prisma imports from default to named exports',
  async run() {
    const fs = require('fs');
    const path = require('path');
    
    // Recursively find all .ts files in the api directory
    const apiDir = path.join(__dirname, 'app', 'api');
    
    // Function to recursively process files
    const processDirectory = (dirPath) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (entry.name.endsWith('.ts')) {
          // Process TypeScript file
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Replace the import pattern
          const updatedContent = content.replace(
            /import\s+prisma\s+from\s+['"]@\/lib\/prisma['"];?/g,
            "import { prisma } from '@/lib/prisma';"
          );
          
          // Only write if content was changed
          if (content !== updatedContent) {
            console.log(`Updated imports in: ${fullPath}`);
            fs.writeFileSync(fullPath, updatedContent, 'utf8');
          }
        }
      }
    };
    
    // Start processing
    console.log('Updating Prisma imports in API routes...');
    processDirectory(apiDir);
    console.log('Done updating Prisma imports.');
  }
}; 