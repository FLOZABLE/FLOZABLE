import * as fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { nanoid } from 'nanoid';
import pMap from 'p-map';

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
  3: Migrate mariadb
  Your choice: `,
  async (rawOption) => {
    const option = parseInt(rawOption.trim());
    if (option === 1) {
      await updateChatrooms();
    } else if (option === 2) {
      await updateRedis();
    } else if (option === 3) {
      await migrateMariadb();
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

const migrateMariadb = async () => {
  const fullDumpFilePath = path.resolve('./tmp/sql/flozable_test2.sql');
  const outputDirectory = path.resolve('./tmp/sql/tables');

  await splitSqlDump(fullDumpFilePath, outputDirectory, false)
    .then(() => console.log('Successfully split the SQL dump.'))
    .catch((err) => console.error('Failed to split SQL dump:', err));
};

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
