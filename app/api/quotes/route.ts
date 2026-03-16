import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM quotes ORDER BY date_created DESC', args: [] });
        return NextResponse.json({ quotes: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { customer, expiryDate, notes, items } = await req.json();
        const id = uuidv4();
        const dateCreated = new Date().toISOString().slice(0, 10);
        let totalAmount = 0;
        if (Array.isArray(items)) {
            totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
        }

        await db.execute({
            sql: 'INSERT INTO quotes (id, customer, date_created, expiry_date, status, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, customer, dateCreated, expiryDate, 'Draft', totalAmount, notes]
        });

        if (Array.isArray(items)) {
            for (const item of items) {
                await db.execute({
                    sql: 'INSERT INTO quote_items (id, quote_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                    args: [uuidv4(), id, item.description, item.quantity, item.price, item.quantity * item.price]
                });
            }
        }

        const result = await db.execute({ sql: 'SELECT * FROM quotes WHERE id = ?', args: [id] });
        return NextResponse.json({ quote: result.rows[0] }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
