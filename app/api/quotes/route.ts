import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// ── Helper: resolve customer name → customer_id ───────────────────────────
async function resolveCustomerId(customer: string): Promise<string> {
  const found = await db.execute({
    sql: `SELECT id FROM customers WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    args: [customer],
  });

  if (found.rows.length > 0) return String(found.rows[0].id);

  const newId = uuidv4();
  await db.execute({
    sql: `INSERT INTO customers (id, name) VALUES (?, ?)`,
    args: [newId, customer],
  });

  return newId;
}

// ── GET /api/quotes ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const result = await db.execute(`
      SELECT q.*, c.name AS customer_name
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer
      ORDER BY q.date_created DESC
    `);
    const formattedQuotes = result.rows.map(row => ({
      ...row,
      customer: row.customer_name,
      amount: row.total_amount,
      validUntil: row.expiry_date
    }));
    return NextResponse.json({ quotes: formattedQuotes });
  } catch (err) {
    console.error('[GET /api/quotes]', err);
    return NextResponse.json({ error: 'Failed to fetch quotes', detail: String(err) }, { status: 500 });
  }
}

// ── POST /api/quotes ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      amount,
      validUntil,
      status = 'Draft',
      notes = '',
      items = '[]',
    } = body;

    if (!customer) return NextResponse.json({ error: 'customer is required' }, { status: 400 });
    if (amount === undefined || amount === null) return NextResponse.json({ error: 'amount is required' }, { status: 400 });

    const customerId = await resolveCustomerId(String(customer));
    const newId = uuidv4();

    await db.execute({
      sql: `INSERT INTO quotes
              (id, customer, total_amount, expiry_date, status, notes, date_created)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        newId,
        customerId,
        Number(amount),
        validUntil ?? null,
        status,
        notes
      ],
    });

    const newQuote = await db.execute({
      sql: `SELECT q.*, c.name AS customer_name
            FROM quotes q
            LEFT JOIN customers c ON c.id = q.customer
            WHERE q.id = ?`,
      args: [newId],
    });

    const row = newQuote.rows[0];
    const formattedQuote = {
      ...row,
      customer: row.customer_name,
      amount: row.total_amount,
      validUntil: row.expiry_date
    };

    return NextResponse.json({ quote: formattedQuote }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/quotes]', err);
    return NextResponse.json({ error: 'Failed to create quote', detail: String(err) }, { status: 500 });
  }
}
