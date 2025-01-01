const dotenv = require("dotenv");
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "../.env.development" });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "../.env.production" });
} else {
  dotenv.config({ path: "../.env.test" });
}
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const {
  createUsersTable,
  createSubjectsTable,
  createSubjectShareTable,
  createSubjectTimelinesTable,
  createGroupsTable,
  createGroupMembersTable,
  createFriendsTable,
  createPlansTable,
  createChatroomsTable,
  createChatroomMembersTable,
  createChatroomMessagesTable,
  createRankingTable,
  createRankingDetailsTable,
  createDevicesTable,
  createThemesTable,
  createUserThemesTable,
  createGroupLikesTable,
  createPlanShare,
  createThemeLikesTable,
  createWebsiteSettingsTable,
  createWebsiteUsageTable,
  createProductsTable,
  createPurchasesTable,
  createNotificationsTable,
} = require("../utils/query");
const pool = require("../model/pool");
const {
  createFriends,
  createBots,
  createGroups,
  updateBotSubjectsColor,
  createGroupChatrooms,
} = require("../Bot/generator");
const { generateRandomId } = require("../utils/tool");

//const prompt = require("prompt-sync")({ sigint: true });

readline.question(
  `
  type command
  maria:VERSION_NAME
  syncStripeProducts
  createBots:NUMBERS
  createGroups:NUMBERS
  createGroupChatrooms
  createFriends:MIN:MAX
  updateBotSubjectColor
  migrateFriendsTable
  `,
  async (command) => {
    if (command.startsWith("maria:")) {
      const [_, _version] = command.split(":");
      const version = parseInt(_version);
      if (version === 0) {
        await initializeMariadb();
      } else if (version === 1) {
        await updateMariaV1();
      }
    } else if (command === "syncStripeProducts") {
      await syncStripeProducts();
    } else if (command.startsWith("createBots:")) {
      const numberOfBots = parseInt(command.split(":")[1]);
      await createBots(numberOfBots);
    } else if (command.startsWith("createGroups:")) {
      const numberOfGroups = parseInt(command.split(":")[1]);
      await createGroups(numberOfGroups);
    } else if (command === "createGroupChatrooms") {
      await createGroupChatrooms();
    } else if (command.startsWith("createFriends:")) {
      const [_, min, max] = command.split(":");
      await createFriends(parseInt(min), parseInt(max));
    } else if (command === "updateBotSubjectColor") {
      await updateBotSubjectsColor();
    } else if (command === "migrateFriendsTable") {
      await migrateFriendsTable();
    }
    readline.close();
  }
);

async function initializeMariadb() {
  try {
    await createUsersTable();
    await createSubjectsTable();
    await createSubjectShareTable();
    await createSubjectTimelinesTable();
    await createGroupsTable();
    await createGroupMembersTable();
    await createGroupLikesTable();
    await createFriendsTable();
    await createPlansTable();
    await createPlanShare();
    await createChatroomsTable();
    await createChatroomMembersTable();
    await createChatroomMessagesTable();
    await createRankingTable();
    await createRankingDetailsTable();
    await createDevicesTable();
    await createThemesTable();
    await createThemeLikesTable();
    await createUserThemesTable();
    await createWebsiteSettingsTable();
    await createWebsiteUsageTable();
    await createProductsTable();
    await createPurchasesTable();
    await createNotificationsTable();

    console.log("Initialized mariadb");
  } catch (err) {
    console.log(err);
  }
}

/* (async () => {
  const command = prompt(`
    type command
    1)auto
    2)maria:VERSION_NAME
    3)syncStripeProducts
    `);
  if (command === "maria:0") {
    await initializeMariadb();
  } else if (command === "syncStripeProducts") {
    await syncStripeProducts();
  }
})(); */

async function syncStripeProducts() {
  try {
    const stripePrices = await stripe.prices.list({
      limit: 100,
    });
    const stripeProducts = await stripe.products.list({
      limit: 100,
    });

    const products = stripeProducts.data.map((product) => {
      const price = stripePrices.data.find(
        (price) => price.id === product.default_price
      );

      const price_id = price ? price.id : null;
      const cost = price ? price.unit_amount : null;
      const interval = price?.recurring?.interval
        ? price.recurring.interval
        : null;

      /* return {
        product_id: product.id,
        name: product.name,
        price_id,
        cost,
        interval
      }; */
      return [product.id, product.name, price_id, cost, interval];
    });

    const connection = pool.promise();

    console.log(products);
    if (products.length) {
      await connection.query(
        `
        INSERT IGNORE INTO products 
        (product_id, name, price_id, cost, \`interval\`) 
        VALUES ?
        `,
        [products]
      );
    }

    console.log(products);
  } catch (err) {
    console.log(err);
  }
}

async function migrateFriendsTable() {
  try {
    const connection = pool.promise();

    const [[oldFriendsTable]] = await connection.query(
      `SHOW TABLES LIKE 'old_friends'`
    );

    // If `old_friends` does not exist, rename `friends` to `old_friends`
    if (!oldFriendsTable) {
      await connection.query(`RENAME TABLE friends TO old_friends`);
      console.log("Renamed `friends` table to `old_friends`.");
    } else {
      console.log("Table `old_friends` already exists. Skipping rename.");
    }

    await createFriendsTable();
    const [rows] = await connection.query("SELECT * FROM old_friends");

    await Promise.all(
      rows.map(async (row) => {
        const friendshipId = generateRandomId(10);

        await connection.query(
          `INSERT INTO friends (friendship_id, user_id, friend_id, status, date) 
         VALUES (?, ?, ?, ?, ?)`,
          [friendshipId, row.user_id, row.friend_id, "accepted", row.date]
        );
      })
    );

    console.log("migration complete", rows.length);
  } catch (err) {
    console.log(err);
  }
}

async function updateMariaV1() {
  try {
    const connection = pool.promise();
    await connection.query(`
      ALTER TABLE subjects MODIFY color VARCHAR(9);
      ALTER TABLE \`groups\` MODIFY description VARCHAR(1000);
      ALTER TABLE plans MODIFY description VARCHAR(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      ALTER TABLE themes MODIFY description VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS level SMALLINT UNSIGNED DEFAULT 1;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak SMALLINT UNSIGNED DEFAULT 0;
    `);
    console.log("udated mariadb v1");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {};
