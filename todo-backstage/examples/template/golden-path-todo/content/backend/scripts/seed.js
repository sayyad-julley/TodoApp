/* eslint-disable no-console */
const bcrypt = require('bcryptjs')
require('dotenv').config()
const pool = require('../src/config/database')

async function seed() {
  console.warn('Seeding development data. Do not run in production!')

  const password = 'password123'
  const hash = await bcrypt.hash(password, 10)

  let userId
  try {
    const userRes = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
       RETURNING id`,
      ['Demo User', 'demo@example.com', hash]
    )
    userId = userRes.rows[0].id
  } catch (err) {
    console.error('Failed to create demo user:', err)
    throw err
  }

  const todos = [
    ['Buy groceries', 'Milk, eggs, bread', false],
    ['Finish project report', 'Due next Monday', false],
    ['Read a book', 'The Pragmatic Programmer', true],
    ['Workout', '30 minutes cardio', false]
  ]

  for (const [title, description, completed] of todos) {
    try {
      await pool.query(
        `INSERT INTO todos (user_id, title, description, completed)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [userId, title, description, completed]
      )
    } catch (err) {
      console.error('Failed to insert todo:', title, err)
      throw err
    }
  }

  console.log('Seed completed successfully')
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(() => pool.end().then(() => process.exit(1)))


