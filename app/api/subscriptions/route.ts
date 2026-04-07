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
      SELECT s.*, c.name AS customer_name
      FROM subscriptions s
      LEFT JOIN customers c ON c.id = s.customer_id
      ORDER BY s.id DESC
    `);
    return NextResponse.json({ subscriptions: result.rows });
  } catch (err) {
    console.error('[GET /api/subscriptions]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      planName    = '',
      amount,
      frequency = 'monthly',
      nextBillingDate,
      status      = 'Active',
      notes       = '',
    } = body;

    if (!customer)
      return NextResponse.json({ error: 'customer is required' }, { status: 400 });
    if (amount === undefined || amount === null)
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });

    const customerId = await resolveCustomerId(String(customer));
    const newId = uuidv4();

    // Note: The UI sends "frequency" but Claude's code expects "billingCycle".
    // "planName" is sent from frontend, matched to "plan_name" in DB.
    await db.execute({
      sql: `INSERT INTO subscriptions
              (id, customer_id, plan_name, amount, frequency, next_billing_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newId,
        customerId,
        planName,
        Number(amount),
        frequency || body.billingCycle,
        nextBillingDate ?? null,
        status,
        notes,
      ],
    });

    const row = await db.execute({
      sql: `SELECT s.*, c.name AS customer_name
            FROM subscriptions s
            LEFT JOIN customers c ON c.id = s.customer_id
            WHERE s.id = ?`,
      args: [newId],
    });

    return NextResponse.json({ subscription: row.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/subscriptions]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
      const { id } = params;
      await db.execute({ sql: 'DELETE FROM subscriptions WHERE id = ?', args: [id] });
      return NextResponse.json({ success: true });
  } catch (e: unknown) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
