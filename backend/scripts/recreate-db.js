const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function recreateDatabase() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error('Missing DB_HOST, DB_USER or DB_NAME in backend/.env');
  }

  const sqlPath = path.join(__dirname, '..', 'db', 'recreate.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const adminConnection = await mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });

  try {
    await adminConnection.query(`DROP DATABASE IF EXISTS \`${database}\`;`);
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await adminConnection.end();
  }

  const dbConnection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    await dbConnection.query(sql);
    console.log(`Database "${database}" has been recreated successfully.`);
  } finally {
    await dbConnection.end();
  }
}

recreateDatabase().catch((error) => {
  console.error('Failed to recreate database:', error.message);
  process.exit(1);
});
