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

// Timestamp + 3-digit random → e.g. DC-20240315-042
function generateChallanNo(): string {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = String(Math.floor(Math.random() * 900) + 100); // 100–999
  return `DC-${date}-${suffix}`;
}

// Retry up to 5 times in the unlikely event of a collision
async function uniqueChallanNo(provided?: string): Promise<string> {
  if (provided?.trim()) return provided.trim();

  for (let i = 0; i < 5; i++) {
    const candidate = generateChallanNo();
    const exists = await db.execute({
      sql: `SELECT 1 FROM delivery_challans WHERE challan_no = ? LIMIT 1`,
      args: [candidate],
    });
    if (exists.rows.length === 0) return candidate;
  }
  return `DC-${Date.now()}`;
}

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT dc.*, c.name AS customer
      FROM delivery_challans dc
      LEFT JOIN customers c ON c.id = dc.customer_id
      ORDER BY dc.id DESC
    `);
    return NextResponse.json({ challans: result.rows });
  } catch (err) {
    console.error('[GET /api/delivery-challans]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      challanNo,
      date,
      items    = '[]',
      status   = 'Dispatched',
      notes    = '',
    } = body;

    if (!customer)
      return NextResponse.json({ error: 'customer is required' }, { status: 400 });

    const customerId = await resolveCustomerId(String(customer));
    const finalNo    = await uniqueChallanNo(challanNo);
    const newId      = uuidv4();

    await db.execute({
      sql: `INSERT INTO delivery_challans
              (id, customer_id, challan_no, date, items, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newId,
        customerId,
        finalNo,
        date ?? new Date().toISOString().split('T')[0],
        typeof items === 'string' ? items : JSON.stringify(items),
        status,
        notes,
      ],
    });

    const row = await db.execute({
      sql: `SELECT dc.*, c.name AS customer
            FROM delivery_challans dc
            LEFT JOIN customers c ON c.id = dc.customer_id
            WHERE dc.id = ?`,
      args: [newId],
    });

    return NextResponse.json({ challan: row.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/delivery-challans]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
      const { id } = params;
      await db.execute({ sql: 'DELETE FROM delivery_challans WHERE id = ?', args: [id] });
      return NextResponse.json({ success: true });
  } catch (e: unknown) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
