import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM customers ORDER BY name ASC', args: [] });
        return NextResponse.json({ customers: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, address } = await req.json();
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            args: [id, name, email, phone, address]
        });
        const result = await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [id] });
        const customer = result.rows[0];
        return NextResponse.json({ customer }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
