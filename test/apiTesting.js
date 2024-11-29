const autocannon = require("autocannon");
const dotenv = require("dotenv");

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "../.env.development" });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "../.env.production" });
} else {
  dotenv.config({ path: "../.env.test" });
}
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function setPath() {
  return new Promise((resolve) => {
    readline.question("Enter the url path: ", (answer) => {
      resolve(answer);
    });
  });
}

async function setMethod() {
  return new Promise((resolve) => {
    readline.question("Enter method: ", (answer) => {
      resolve(answer);
    });
  });
}

async function setData() {
  return new Promise((resolve) => {
    readline.question("Enter data: ", (answer) => {
      resolve(answer);
    });
  });
}

async function setConnections() {
  return new Promise((resolve) => {
    readline.question("Enter the connections: ", (answer) => {
      resolve(answer);
    });
  });
}

async function setDuration() {
  return new Promise((resolve) => {
    readline.question("Enter the duration: ", (answer) => {
      resolve(answer);
    });
  });
}

(async () => {
  try {
    const path = await setPath();
    const method = await setMethod();
    const data = await setData();
    const connections = await setConnections();
    const duration = await setDuration();

    autocannon({
      url: process.env.SERVER + path,
      connections: connections !== "" ? connections : 1000,
      duration: duration !== "" ? duration : 10,
      timeout: 20000,
      excludeErrorStats: true,
    })
      .on("tick", (count) => {
        console.log(`Requests made so far: ${count.counter}`);
      })
      .on("done", (result) => {
        console.log("Benchmark complete", result);
        console.log("Latency avg:", result.latency.average);
        console.log(`Requests per second: ${result.requests.average}`);
      });
  } catch (err) {
    console.log(err);
  }
})();
