import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { PaymentSchema } from '@/lib/schemas';
import { z } from 'zod';

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
        const body = await req.json();
        const validatedData = PaymentSchema.parse(body);
        const { customer, amount, method, date, note } = validatedData;
        
        const id = uuidv4();
        const paymentDate = date || validatedData.dateReceived || new Date().toISOString().slice(0, 10);

        await db.execute({
            sql: 'INSERT INTO payments_received (id, customer, amount, method, date, note) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, customer, amount, method, paymentDate, note || null]
        });
        const result = await db.execute({ sql: 'SELECT * FROM payments_received WHERE id = ?', args: [id] });
        return NextResponse.json({ payment: result.rows[0] }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
