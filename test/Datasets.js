const pool = require("../model/pool");
const converter = require('json-2-csv');
const fs = require("fs");

const userId = "EoFObpf612bdJKt";

async function getSubjects() {
  const connection = pool.promise();
  const [subjects] = await connection.query(`SELECT * FROM subjects where user_id = ?`, [userId]);
  const csv = await converter.json2csv(subjects);
  fs.writeFileSync('subjects.csv', csv);
};

async function getPlans() {
  const connection = pool.promise();
  const [subjects] = await connection.query(`SELECT * FROM plans where user_id = ?`, [userId]);
  const csv = await converter.json2csv(subjects);
  fs.writeFileSync('plans.csv', csv);
};

module.exports = {getSubjects, getPlans};