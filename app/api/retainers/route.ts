import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT ri.*, c.name AS customer_name
      FROM retainer_invoices ri
      LEFT JOIN customers c ON c.id = ri.customer_id
      ORDER BY ri.id DESC
    `);
    return NextResponse.json({ retainers: result.rows });
  } catch (err) {
    console.error('[GET /api/retainers]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      amount,
      billingDay = 1,
      startDate,
      status     = 'Active',
      notes      = '',
    } = body;

    if (!customer)
      return NextResponse.json({ error: 'customer is required' }, { status: 400 });
    if (amount === undefined || amount === null)
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });

    const customerId = await resolveCustomerId(String(customer));
    const newId = uuidv4();

    await db.execute({
      sql: `INSERT INTO retainer_invoices
              (id, customer_id, amount, billing_day, start_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newId,
        customerId,
        Number(amount),
        Number(billingDay),
        startDate || null,
        status,
        notes,
      ],
    });

    const row = await db.execute({
      sql: `SELECT ri.*, c.name AS customer
            FROM retainer_invoices ri
            LEFT JOIN customers c ON c.id = ri.customer_id
            WHERE ri.id = ?`,
      args: [newId],
    });

    return NextResponse.json({ retainer: row.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/retainers]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
      const { id } = params;
      await db.execute({ sql: 'DELETE FROM retainer_invoices WHERE id = ?', args: [id] });
      return NextResponse.json({ success: true });
  } catch (e: unknown) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
