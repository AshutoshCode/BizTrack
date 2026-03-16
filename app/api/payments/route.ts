import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM payments_received ORDER BY date DESC', args: [] });
        return NextResponse.json({ payments: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { customer, amount, method, date, note } = await req.json();
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO payments_received (id, customer, amount, method, date, note) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, customer, amount, method, date, note]
        });
        const result = await db.execute({ sql: 'SELECT * FROM payments_received WHERE id = ?', args: [id] });
        return NextResponse.json({ payment: result.rows[0] }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
