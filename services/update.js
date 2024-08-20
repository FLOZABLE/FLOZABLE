const dotenv = require("dotenv");
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "../.env.development" });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "../.env.production" });
} else {
  dotenv.config({ path: "../.env.test" });
}
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const {
  createUsersTable,
  createSubjectsTable,
  createSubjectShareTable,
  createSubjectSharedTable,
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
  createPlanShared,
  createThemeLikesTable,
  createWebsiteSettingsTable,
  createWebsiteUsageTable,
  createProductsTable,
  createPurchasesTable,
} = require("../Utils/query");
const pool = require("../model/pool");

const prompt = require("prompt-sync")({ sigint: true });

async function initializeMariadb() {
  try {
    await createUsersTable();
    await createSubjectsTable();
    await createSubjectShareTable();
    await createSubjectSharedTable();
    await createSubjectTimelinesTable();
    await createGroupsTable();
    await createGroupMembersTable();
    await createGroupLikesTable();
    await createFriendsTable();
    await createPlansTable();
    await createPlanShare();
    await createPlanShared();
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

    console.log("Initialized mariadb");
  } catch (err) {
    console.log(err);
  }
}

(async () => {
  const command = prompt(`
    type command
    1)auto
    2)maria:VERSION_NAME
    3)syncStripeProducts
    `);
  /* if (command.includes("maria")) {
      const version = parseFloat(command.split(":")[1]);
      console.log(version)
    } */
  if (command === "maria:0") {
    await initializeMariadb();
  } else if (command === "syncStripeProducts") {
    await syncStripeProducts();
  }
})();

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

    console.log(products)
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

module.exports = {};
