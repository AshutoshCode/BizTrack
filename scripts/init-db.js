const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      unit TEXT,
      category TEXT,
      quantity REAL DEFAULT 0,
      active INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT,
      amount REAL,
      category TEXT,
      date TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      customer TEXT,
      date_created TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'UNPAID',
      total_amount REAL,
      paid_date TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT REFERENCES invoices(id),
      product_id TEXT,
      description TEXT,
      quantity REAL,
      price REAL,
      total REAL
    )`,
    `CREATE TABLE IF NOT EXISTS payments_received (
      id TEXT PRIMARY KEY,
      customer TEXT,
      amount REAL,
      method TEXT,
      date TEXT,
      note TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS payment_links (
      id TEXT PRIMARY KEY,
      customer TEXT,
      amount REAL,
      description TEXT,
      expiry TEXT,
      status TEXT DEFAULT 'Active',
      url TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS recurring_expenses (
      id TEXT PRIMARY KEY,
      description TEXT,
      amount REAL,
      category TEXT,
      frequency TEXT,
      next_date TEXT,
      active INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      project TEXT,
      date TEXT,
      hours REAL,
      billable INTEGER DEFAULT 0,
      invoice_id TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      customer TEXT,
      date_created TEXT,
      expiry_date TEXT,
      status TEXT DEFAULT 'Draft',
      total_amount REAL,
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT REFERENCES quotes(id),
      description TEXT,
      quantity REAL,
      price REAL,
      total REAL
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
  ];

  for (const sql of tables) {
    await db.execute(sql);
    console.log('Created table OK');
  }
  console.log('All tables ready.');
}

init().catch(console.error);
