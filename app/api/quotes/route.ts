import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { QuoteSchema } from '@/lib/schemas';
import { z } from 'zod';

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
        const body = await req.json();
        const validatedData = QuoteSchema.parse(body);
        const { customer, expiry_date, notes, items } = validatedData;
        
        const id = uuidv4();
        const dateCreated = validatedData.dateCreated || new Date().toISOString().slice(0, 10);
        const safeItems = items ?? [];
        const totalAmount = safeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const stmts = [
            {
                sql: 'INSERT INTO quotes (id, customer, date_created, expiry_date, status, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [id, customer, dateCreated, expiry_date || null, 'Draft', totalAmount, notes || null]
            }
        ];

        for (const item of safeItems) {
            stmts.push({
                sql: 'INSERT INTO quote_items (id, quote_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), id, item.description, item.quantity, item.price, item.quantity * item.price]
            });
        }

        await db.batch(stmts, 'write');

        const result = await db.execute({ sql: 'SELECT * FROM quotes WHERE id = ?', args: [id] });
        return NextResponse.json({ quote: result.rows[0] }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
