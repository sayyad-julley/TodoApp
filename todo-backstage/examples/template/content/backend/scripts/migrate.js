/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const pool = require('../src/config/database')

async function run() {
  const migrationsDir = path.resolve(__dirname, '../../database/migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`Running ${files.length} migration(s) ...`)

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(fullPath, 'utf8')
    process.stdout.write(`Applying ${file} ... `)
    try {
      await pool.query(sql)
      console.log('OK')
    } catch (err) {
      console.error('\nMigration failed:', file)
      console.error(err)
      throw err
    }
  }
}

run()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(() => pool.end().then(() => process.exit(1)))


