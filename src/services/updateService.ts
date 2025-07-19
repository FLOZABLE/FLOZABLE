import * as fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { nanoid } from 'nanoid';
import pMap from 'p-map';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { deleteKeysByPattern, renameKeysByPattern } from './cacheService';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(
  `
  SELECT OPTION:
  1: Update chatrooms
  2: Clean redis
  3: Mariadb - split files
  4: Mariadb - update files
  5: Mariadb - insert

  Your choice: `,
  async (rawOption) => {
    const option = parseInt(rawOption.trim());
    if (option === 1) {
      await updateChatrooms();
    } else if (option === 2) {
      await updateRedis();
    } else if (option === 3) {
      const fullDumpFilePath = path.resolve('./tmp/sql/flozable_test2.sql');
      await splitSqlDump(fullDumpFilePath, outputDirectory, false)
        .then(() => console.log('Successfully split the SQL dump.'))
        .catch((err) => console.error('Failed to split SQL dump:', err));
    } else if (option === 4) {
      const inputSqlFile = path.resolve('./tmp/sql/tables/chatrooms.sql');
      const outputSqlFile = path.resolve('./tmp/sql/tables/chatrooms.sql');

      await updateChatroomsSql(inputSqlFile, outputSqlFile)
        .then(() =>
          console.log('Chatrooms SQL simple transformation script finished.'),
        )
        .catch((err) =>
          console.error(
            'Chatrooms SQL simple transformation script failed:',
            err,
          ),
        );
    } else if (option === 5) {
      await mariadbApplyUpdate(outputDirectory);
    } else {
      console.log('Invalid option selected.');
    }

    readline.close();
    process.exit(0);
  },
);

const updateChatrooms = async () => {
  try {
    console.log('Fetching chatrooms...');
    const chatrooms = await prisma.chatrooms.findMany({
      select: { members: true, chatroom_id: true },
    });

    const possibleGroupChatrooms: string[] = chatrooms
      .filter((chatroom) => chatroom.members.length === 0)
      .map((chatroom) => chatroom.chatroom_id);

    if (!possibleGroupChatrooms.length) {
      console.log('No group chatrooms found needing update.');
      return;
    }

    console.log(
      `Possible group chatrooms to update: ${possibleGroupChatrooms.join(', ')}`,
    );

    const groups = await prisma.groups.findMany({
      where: {
        group_id: { in: possibleGroupChatrooms },
      },
    });

    if (!groups.length) {
      console.log('No matching groups found for these chatrooms.');
      return;
    }

    console.log(`Found ${groups.length} groups to update.`);

    await pMap(
      groups,
      async (group) => {
        const newChatroomId = nanoid(10);

        await prisma.chatrooms.update({
          data: {
            chatroom_id: newChatroomId,
            group_id: group.group_id,
            type: 'group',
          },
          where: {
            chatroom_id: group.group_id,
          },
        });

        console.log(
          `Updated chatroom for group: ${group.name} (new chatroom_id: ${newChatroomId})`,
        );
      },
      { concurrency: 1 }, // Safely update up to 10 chatrooms in parallel
    );

    console.log('🎉 All updates complete!');
  } catch (err) {
    console.error('❌ Error updating chatrooms:', err);
  }
};

const updateRedis = async () => {
  try {
    //deletion
    await deleteKeysByPattern('*sess*');
    await deleteKeysByPattern('*activeSubject*');
    await deleteKeysByPattern('*:subject:*');
    await deleteKeysByPattern('*:friends:*');
    await deleteKeysByPattern('*:activeGroup*');
    await deleteKeysByPattern('*:googleAccessToken*');
    await deleteKeysByPattern('*:messages*');
    await deleteKeysByPattern('activeBots');
    await deleteKeysByPattern('vapidKeys');

    for (const element of ['day', 'week', 'month']) {
      for (let i = 1; i <= 2; i++) {
        await deleteKeysByPattern(`${element}${i}`);
      }
    }

    await renameKeysByPattern('users:*:*Total', mapStudyTimeKey);
  } catch (err) {
    console.log(err);
  }
};

function mapStudyTimeKey(oldKey: string) {
  const parts = oldKey.split(':');
  // Expected format: users:<viewerId>:<period>Total
  // Length should be 3. First part 'users'. Last part ends with 'Total'.
  const timezoneOffset = Number(parts[1]);
  if (
    parts.length === 3 &&
    parts[0] === 'users' &&
    parts[2].endsWith('Total') &&
    typeof timezoneOffset === 'number'
  ) {
    const period = parts[2].replace('Total', ''); // Extracts 'day', 'week', or 'month'

    // Validate the period
    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(period)) {
      console.log(
        `Skipping key '${oldKey}': Invalid period detected '${period}'`,
      );
      return null;
    }

    const newKey = `studytime:${period}:timezone:${timezoneOffset}`;
    return newKey;
  }
  return null; // Key doesn't match the expected format for this specific rename
}

const outputDirectory = path.resolve('./tmp/sql/tables');

async function splitSqlDump(
  inputFilePath: string,
  outputDir: string,
  includeSchema: boolean = false,
): Promise<void> {
  // Regex to capture the table name from the dump comment
  // Matches: -- Dumping data for table `tablename`
  // Also matches: -- Table structure for table `tablename`
  const dataMarkerRegex = /^-- Dumping data for table `(\w+)`/;
  const schemaMarkerRegex = /^-- Table structure for table `(\w+)`/;

  console.log(`Starting to split SQL dump: ${inputFilePath}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Include schema (CREATE TABLE statements): ${includeSchema}`);

  try {
    await fs.promises.mkdir(outputDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating output directory ${outputDir}:`, error);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(inputFilePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentTableName: string | null = null;
  let currentFileWriter: fs.WriteStream | null = null;
  let lineCount = 0;
  const tableCounts: { [tableName: string]: number } = {};

  for await (const line of rl) {
    lineCount++;
    const dataMatch = line.match(dataMarkerRegex);
    const schemaMatch = line.match(schemaMarkerRegex);

    let newTableDetected = false;
    let detectedTableName: string | null = null;

    // Prioritize data marker for switching, but capture schema marker for initial table detection
    if (dataMatch) {
      detectedTableName = dataMatch[1];
      newTableDetected = true;
    } else if (schemaMatch && !currentTableName) {
      // Only use schema marker if no table is currently being processed
      // This helps capture the very first table's schema
      detectedTableName = schemaMatch[1];
      // newTableDetected will be true below if detectedTableName is set
    }

    if (newTableDetected && detectedTableName) {
      // Close previous file if open
      if (currentFileWriter) {
        currentFileWriter.end();
        if (currentTableName) {
          console.log(
            `  - Finished ${currentTableName}.sql (${tableCounts[currentTableName] || 0} lines)`,
          );
        }
      }

      currentTableName = detectedTableName;
      tableCounts[currentTableName] = 0;
      const outputFilePath = path.join(outputDir, `${currentTableName}.sql`);
      currentFileWriter = fs.createWriteStream(outputFilePath);
      console.log(`Writing to: ${currentTableName}.sql`);

      // Write header for the new file (optional but good practice)
      currentFileWriter.write(`-- Data for table \`${currentTableName}\`\n\n`);
    }

    // Write the current line to the appropriate file
    if (currentFileWriter) {
      // If we are *not* including schema, skip schema related lines for already started tables
      // The logic for schema is a bit tricky with `mysqldump` as schema comes *before* data.
      // For a dump with --no-create-info, this is easier.
      // For a full dump, if includeSchema is false, we try to skip schema lines.
      // This part might need fine-tuning depending on the exact dump structure.
      if (!includeSchema) {
        // Skip comments and SET statements that usually precede data blocks for full dump
        if (line.startsWith('--') && !dataMatch) continue; // Skip all comments that aren't the data marker
        if (
          line.startsWith('SET') ||
          line.startsWith('/*!') ||
          line.startsWith('UNLOCK TABLES;') ||
          line.startsWith('LOCK TABLES ')
        )
          continue;
      }

      currentFileWriter.write(line + '\n');
      if (currentTableName) {
        tableCounts[currentTableName]++;
      }
    }
  }

  // Close the last file
  if (currentFileWriter) {
    currentFileWriter.end();
    if (currentTableName) {
      console.log(
        `  - Finished ${currentTableName}.sql (${tableCounts[currentTableName] || 0} lines)`,
      );
    }
  }

  console.log(
    `\nSQL dump splitting complete. Total lines processed: ${lineCount}`,
  );
  console.log('Summary of tables exported and their line counts:', tableCounts);
}

/**
 * Executes a single SQL file against the database using Prisma's $executeRaw.
 * @param filePath The absolute path to the SQL file containing INSERT statements.
 * @returns A Promise that resolves if successful, or rejects with an error.
 */ async function executeSqlFileWithPrisma(
  filePath: string,
  fileName: string, // Pass filename for better logging
): Promise<void> {
  console.log(`  - Importing ${fileName} using Prisma...`);
  try {
    let sqlContent = await fs.promises.readFile(filePath, { encoding: 'utf8' });

    // Step 1: Remove BOM if present (often invisible, can cause parsing issues)
    if (sqlContent.charCodeAt(0) === 0xfeff) {
      // BOM character
      sqlContent = sqlContent.slice(1);
      console.log(`    Removed BOM from ${fileName}`);
    }

    // Step 2: Aggressively clean comments and empty lines
    let cleanedSqlContent = sqlContent
      // Remove any lines that are solely comments
      .split('\n')
      .filter(
        (line) =>
          !line.trim().startsWith('--') && !line.trim().startsWith('/*'),
      )
      .map((line) => line.replace(/\/\*.*?\*\//g, '').trim()) // Remove inline multi-line comments
      .filter((line) => line.length > 0) // Remove empty lines after cleaning
      .join('\n'); // Rejoin the lines

    // Final trim to remove any leading/trailing whitespace around the entire content
    cleanedSqlContent = cleanedSqlContent.trim();

    if (cleanedSqlContent.length === 0) {
      console.warn(
        `    No executable SQL content found in ${fileName}. Skipping.`,
      );
      return;
    }

    // --- CRITICAL FIX HERE: Use Prisma.raw() to pass a plain string as raw SQL ---
    // Prisma.raw() is designed to take a single string argument and treat it as exact raw SQL.
    const sqlQuery = Prisma.raw(cleanedSqlContent);

    // Now execute the raw SQL query object
    const affectedRows = await prisma.$executeRaw(sqlQuery);

    console.log(
      `    Successfully imported ${fileName}. Affected rows: ${affectedRows}`,
    );
  } catch (error: any) {
    throw new Error(`Failed to import ${fileName}: ${error.message}`);
  }
}

/**
 * Imports all .sql files from a given directory into the database using Prisma.
 * @param sqlFilesDirectory The absolute path to the directory containing the .sql files.
 */
async function mariadbApplyUpdate(sqlFilesDirectory: string): Promise<void> {
  console.log(`Starting import of SQL files from: ${sqlFilesDirectory}`);

  try {
    const files = await fs.promises.readdir(sqlFilesDirectory);
    const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort(); // Sort for consistent order

    if (sqlFiles.length === 0) {
      console.warn('No .sql files found in the specified directory.');
      return;
    }

    // --- IMPORTANT: Foreign Key Checks ---
    // For large imports or imports where data order is uncertain, temporarily
    // disabling foreign key checks is highly recommended to avoid errors.
    // This is done via raw SQL commands sent through Prisma.
    console.log('\n--- Disabling Foreign Key Checks ---');
    try {
      await prisma.$executeRaw(Prisma.sql`SET FOREIGN_KEY_CHECKS=0;`); // Use Prisma.sql here too
      console.log('Foreign key checks disabled.');
    } catch (e: any) {
      console.error(
        'Failed to disable foreign key checks (might not be supported by your DB/driver or already disabled):',
        e.message,
      );
    }
    console.log('------------------------------------\n');

    let successCount = 0;
    let failCount = 0;
    const failedFiles: string[] = [];

    for (const file of sqlFiles) {
      const filePath = path.join(sqlFilesDirectory, file);
      try {
        await executeSqlFileWithPrisma(filePath, file);
        successCount++;
      } catch (error: any) {
        console.error(`Error importing ${file}: ${error.message}`);
        failedFiles.push(file);
        failCount++;
      }
    }

    // --- IMPORTANT: Re-enabling Foreign Key Checks ---
    console.log('\n--- Re-enabling Foreign Key Checks ---');
    try {
      await prisma.$executeRaw(Prisma.sql`SET FOREIGN_KEY_CHECKS=1;`); // Use Prisma.sql here too
      console.log('Foreign key checks re-enabled.');
    } catch (e: any) {
      console.error('Failed to re-enable foreign key checks:', e.message);
    }
    console.log('------------------------------------\n');

    console.log('\n--- Import Summary ---');
    console.log(`Total files processed: ${sqlFiles.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed to import: ${failCount}`);
    if (failedFiles.length > 0) {
      console.log('Files that failed to import:', failedFiles);
    }
    console.log('--------------------');
  } catch (error: any) {
    console.error(
      'An unrecoverable error occurred during the import process:',
      error.message || error,
    );
  } finally {
    // Disconnect Prisma Client after all operations are complete
    await prisma.$disconnect();
  }
}

/**
 * Performs simple string replacements to transform chatrooms data in an SQL file.
 * Specifically:
 * - Replaces ',1)' with ",'room', NULL)"
 * - Replaces ',0)' with ",'group', NULL)"
 * @param inputFilePath The absolute path to the original chatrooms.sql file.
 * @param outputFilePath The absolute path for the transformed output file.
 */
async function updateChatroomsSql(
  inputFilePath: string,
  outputFilePath: string,
): Promise<void> {
  console.log(`Starting simple transformation of: ${inputFilePath}`);
  console.log(`Writing transformed content to: ${outputFilePath}`);

  try {
    // Read the entire file content as a single string
    let fileContent = await fs.promises.readFile(inputFilePath, {
      encoding: 'utf8',
    });

    // --- NEW REPLACEMENT: Replace NULL in name field with empty string ---
    // This needs to happen first to target the specific NULL in the second position
    fileContent = fileContent.replace(/,NULL,/g, ',"",'); // Replace all occurrences of ,NULL,

    // Perform replacements globally
    // Important: Do '1' first, then '0' to avoid partial matches if numbers could be longer.
    // For single digits 0 and 1, order doesn't strictly matter, but it's good practice.
    fileContent = fileContent.replace(/,1\)/g, ",'room', NULL)"); // Replace all occurrences of ',1)'
    fileContent = fileContent.replace(/,0\)/g, ",'group', NULL)"); // Replace all occurrences of ',0)'

    // Write the modified content to the output file
    await fs.promises.writeFile(outputFilePath, fileContent, {
      encoding: 'utf8',
    });

    console.log(
      `Simple transformation complete. Output saved to: ${outputFilePath}`,
    );
  } catch (error: any) {
    console.error(`Error during simple transformation: ${error.message}`);
    throw error;
  }
}
