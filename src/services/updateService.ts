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

const tablesPath = path.resolve('./tmp/sql/tables/');

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
      await splitSqlDump(fullDumpFilePath, outputDirectory, false, [
        'notifications',
        'old_friends',
        'plans',
        'products',
        'purchases',
        'plan_share',
        'subject_share',
      ])
        .then(() => console.log('Successfully split the SQL dump.'))
        .catch((err) => console.error('Failed to split SQL dump:', err));
    } else if (option === 4) {
      await updateChatroomsSql()
        .then(() =>
          console.log('Chatrooms SQL simple transformation script finished.'),
        )
        .catch((err) =>
          console.error(
            'Chatrooms SQL simple transformation script failed:',
            err,
          ),
        );
      await updateGroupMembersSql(1728730426)
        .then(() =>
          console.log(
            'Group members SQL simple transformation script finished.',
          ),
        )
        .catch((err) =>
          console.error(
            'Group members SQL simple transformation script failed:',
            err,
          ),
        );
      await updateGroupsSql()
        .then(() =>
          console.log('Groups SQL simple transformation script finished.'),
        )
        .catch((err) =>
          console.error('Groups SQL simple transformation script failed:', err),
        );

      await updateChatroomMessagesSql()
        .then(() =>
          console.log(
            'Chatroom messages SQL simple transformation script finished.',
          ),
        )
        .catch((err) =>
          console.error(
            'Chatroom messages SQL simple transformation script failed:',
            err,
          ),
        );

      await updateSubjectsSql()
        .then(() =>
          console.log('Subjects SQL simple transformation script finished.'),
        )
        .catch((err) =>
          console.error(
            'Subjects SQL simple transformation script failed:',
            err,
          ),
        );
    } else if (option === 5) {
      await mariadbApplyUpdate(outputDirectory, ['subject_timelines']);
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
  filteredList: string[] = [], // The list of table names to skip
): Promise<void> {
  // Regex to capture the table name from the dump comment
  // Matches: -- Dumping data for table `tablename`
  // Also matches: -- Table structure for table `tablename`
  const dataMarkerRegex = /^-- Dumping data for table `(\w+)`/;
  const schemaMarkerRegex = /^-- Table structure for table `(\w+)`/;

  console.log(`Starting to split SQL dump: ${inputFilePath}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Include schema (CREATE TABLE statements): ${includeSchema}`);
  console.log(
    `Filtered tables (will be skipped): [${filteredList.join(', ')}]`,
  );

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
  const skippedTableNames: Set<string> = new Set(); // To track genuinely skipped tables

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
      // This helps capture the very first table's schema structure comment
      detectedTableName = schemaMatch[1];
      // newTableDetected will implicitly be true if detectedTableName is set
      if (detectedTableName) newTableDetected = true;
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

      currentTableName = detectedTableName; // Always update to know which table block we're currently in

      if (filteredList.includes(currentTableName)) {
        console.log(`Skipping table '${currentTableName}' (in filtered list).`);
        currentFileWriter = null; // Set to null to prevent writing lines for this table
        skippedTableNames.add(currentTableName); // Add to skipped set for summary
      } else {
        // This is a table we want to export
        tableCounts[currentTableName] = 0; // Initialize count for the new table
        const outputFilePath = path.join(outputDir, `${currentTableName}.sql`);
        currentFileWriter = fs.createWriteStream(outputFilePath);
        console.log(`Writing to: ${currentTableName}.sql`);

        // Write header for the new file (optional but good practice)
        currentFileWriter.write(
          `-- Data for table \`${currentTableName}\`\n\n`,
        );
      }
    }

    // Write the current line to the appropriate file *only if* currentFileWriter is active (not null)
    if (currentFileWriter) {
      // If we are *not* including schema, skip schema related lines for already started tables
      if (!includeSchema) {
        // Skip comments and SET statements that usually precede data blocks for full dump
        if (line.startsWith('--') && !dataMatch && !schemaMatch) continue; // Skip all comments that aren't markers
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
        // currentTableName will not be null if currentFileWriter is not null
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
  if (skippedTableNames.size > 0) {
    console.log(
      'Tables skipped (not exported):',
      Array.from(skippedTableNames).join(', '),
    );
  } else {
    console.log('No tables were skipped.');
  }
}

/**
 * Executes a single SQL file against the database using Prisma's $executeRaw.
 * It now splits large files into individual statements to avoid connection issues.
 * @param filePath The absolute path to the SQL file containing INSERT statements.
 * @param fileName The name of the file for better logging.
 * @param ignoreInsertTables An array of table names for which INSERT statements should become INSERT IGNORE.
 * @returns A Promise that resolves if successful, or rejects with an error.
 */
async function executeSqlFileWithPrisma(
  filePath: string,
  fileName: string, // Pass filename for better logging
  ignoreInsertTables: string[] = [], // NEW: Array of tables for INSERT IGNORE
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
    // This cleaning is crucial for robust semicolon splitting later
    let cleanedSqlContent = sqlContent
      // Remove any lines that are solely comments
      .split('\n')
      .filter(
        (line) =>
          !line.trim().startsWith('--') &&
          !line.trim().startsWith('/*') && // Catches lines starting with multi-line comments
          !line.trim().startsWith('#'), // Also common for single-line comments in some SQL dumps
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

    // --- NEW STRATEGY: SPLIT AND EXECUTE INDIVIDUAL STATEMENTS ---
    // SQL statements are typically delimited by a semicolon ';'.
    // We split by ';' then filter out any empty strings and trim whitespace.
    // We must add the semicolon back before execution as `split` removes it.
    const statements = cleanedSqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (statements.length === 0) {
      console.warn(
        `    No executable SQL statements found in ${fileName} after splitting by semicolon. Skipping.`,
      );
      return;
    }

    console.log(
      `    Executing ${statements.length} statements from ${fileName}...`,
    );

    let affectedRowsTotal = 0;
    // Normalize ignoreInsertTables for case-insensitive comparison
    const ignoreTablesLowerCase = ignoreInsertTables.map((name) =>
      name.toLowerCase(),
    );

    for (const [index, statement] of statements.entries()) {
      try {
        let currentStatement = statement; // Use a mutable variable for the statement

        // Check if this statement is an INSERT INTO operation
        // and if its table is in the ignoreInsertTables list
        // Uses a regex to capture the table name (handles `table_name` or table_name)
        const insertMatch = currentStatement.match(/^INSERT INTO `?(\w+)`?/i);

        if (insertMatch && insertMatch[1]) {
          const tableNameInSql = insertMatch[1]; // Captured table name (e.g., 'subject_timelines')

          // Compare in a case-insensitive manner
          if (ignoreTablesLowerCase.includes(tableNameInSql.toLowerCase())) {
            // Replace "INSERT INTO" with "INSERT IGNORE INTO" at the beginning of the statement
            currentStatement = currentStatement.replace(
              /^INSERT INTO/i,
              'INSERT IGNORE INTO',
            );
            console.log(
              `      Modified: Applying INSERT IGNORE for table '${tableNameInSql}' in ${fileName}, statement ${index + 1}`,
            );
          }
        }

        // Use Prisma.raw() for each individual statement
        // Add the semicolon back as it's the statement terminator
        const sqlQuery = Prisma.raw(currentStatement + ';');
        const affected = await prisma.$executeRaw(sqlQuery);
        affectedRowsTotal += Number(affected); // Ensure affectedRows is treated as a number
      } catch (stmtError: any) {
        console.error(
          `      Error in ${fileName}, statement ${
            index + 1
          }/${statements.length}: ${stmtError.message}\n      Failed Statement (first 200 chars): ${statement.substring(
            0,
            200,
          )}...`,
        );
        // Re-throw the error so the main `mariadbApplyUpdate` function can catch it and log the file as failed.
        throw new Error(
          `Statement ${index + 1} failed in ${fileName}: ${stmtError.message}`,
        );
      }
    }

    console.log(
      `    Successfully imported ${fileName}. Total affected rows: ${affectedRowsTotal}`,
    );
  } catch (error: any) {
    // This catch block handles errors from file reading or initial cleaning/splitting
    throw new Error(`Failed to import ${fileName}: ${error.message}`);
  }
}

/**
 * Imports all .sql files from a given directory into the database using Prisma.
 * @param sqlFilesDirectory The absolute path to the directory containing the .sql files.
 * @param ignoreList An optional array of table names for which INSERT statements should become INSERT IGNORE.
 */
async function mariadbApplyUpdate(
  sqlFilesDirectory: string,
  ignoreList: string[] = [],
): Promise<void> {
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
        // Pass the ignoreList to executeSqlFileWithPrisma
        await executeSqlFileWithPrisma(filePath, file, ignoreList);
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
async function updateChatroomsSql(): Promise<void> {
  const inputFilePath = path.join(tablesPath, 'chatrooms.sql');
  const outputFilePath = path.join(tablesPath, 'chatrooms.sql');
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

async function updateGroupMembersSql(defaultJoined: number): Promise<void> {
  const inputFilePath = path.join(tablesPath, 'group_members.sql');
  const outputFilePath = path.join(tablesPath, 'group_members.sql');

  console.log(`Starting simple transformation of: ${inputFilePath}`);
  console.log(`Writing transformed content to: ${outputFilePath}`);

  try {
    // Read the entire file content as a single string
    let fileContent = await fs.promises.readFile(inputFilePath, {
      encoding: 'utf8',
    });

    fileContent = fileContent.replace(/,NULL/g, `,${defaultJoined}`);

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

async function updateGroupsSql(): Promise<void> {
  const inputFilePath = path.join(tablesPath, 'groups.sql');
  const outputFilePath = path.join(tablesPath, 'groups.sql');

  console.log(`Starting simple transformation of: ${inputFilePath}`);
  console.log(`Writing transformed content to: ${outputFilePath}`);

  try {
    // Read the entire file content as a single string
    let fileContent = await fs.promises.readFile(inputFilePath, {
      encoding: 'utf8',
    });

    fileContent = fileContent.replace(/,'[a-zA-Z0-9]{64,}',/g, ',');
    fileContent = fileContent.replace(/,'[a-zA-Z0-9]{64,}',/g, ',NULL,');

    fileContent = fileContent.replace(/,0,/g, ',1,');

    //fileContent = fileContent.replace(/,\s*(?:NULL|'[^']*?'|\d+)\)/g, ')');

    //fileContent = fileContent.replace(/,\s*\d+\s*\)\s*,?$/gm, '),');
    fileContent = fileContent.replace(/(.*),\s*(NULL|\d+)\s*(\)\s*[;,]?\s*)$/gim, '$1$3');

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

async function updateChatroomMessagesSql(): Promise<void> {
  const inputFilePath = path.join(tablesPath, 'chatroom_messages.sql');
  const outputFilePath = path.join(tablesPath, 'chatroom_messages.sql');

  console.log(`Starting simple transformation of: ${inputFilePath}`);
  console.log(`Writing transformed content to: ${outputFilePath}`);

  try {
    // Read the entire file content as a single string
    let fileContent = await fs.promises.readFile(inputFilePath, {
      encoding: 'utf8',
    });

    fileContent = fileContent.replace(/\\'/g, "''");
    // This regex attempts to remove semicolons from unclosed string literals
    // followed by a comma or parenthesis. Highly speculative and may break.
    fileContent = fileContent.replace(/(?<=\'[^\']*?);(?=[^\']*?[,\)])/g, '');

    fileContent = fileContent.replace(/\[/g, ''); // Your existing line
    fileContent = fileContent.replace(/\]/g, ''); // Your existing line

    fileContent = fileContent.replace(
      /'((?:[^']|'')*);((?:[^']|'')*)'/g,
      "'$1$2'",
    );

    fileContent = fileContent.replace('rgebpodjih;', '');

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

async function updateSubjectsSql(): Promise<void> {
  const inputFilePath = path.join(tablesPath, 'subjects.sql');
  const outputFilePath = path.join(tablesPath, 'subjects.sql');

  console.log(`Starting simple transformation of: ${inputFilePath}`);
  console.log(`Writing transformed content to: ${outputFilePath}`);

  try {
    // Read the entire file content as a single string
    let fileContent = await fs.promises.readFile(inputFilePath, {
      encoding: 'utf8',
    });

    fileContent = fileContent.replace(/,NULL,/g, ',');

    fileContent = fileContent.replace(
      /(^.*?'others',\s*)('[^']*(?:''[^']*)*?'\s*),\s*'others',\s*('[^']*(?:''[^']*)*?')(\s*,\s*\d+\)\s*,?\s*$)/gm,
      '$1$2,$3$4',
    );

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
