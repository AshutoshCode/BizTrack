import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { PaymentLinkSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM payment_links ORDER BY expiry DESC', args: [] });
        return NextResponse.json({ links: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = PaymentLinkSchema.parse(body);
        const { customer, amount, description, expiry } = validatedData;
        
        const id = uuidv4();
        const url = "#pay-" + id.slice(0, 8);
        await db.execute({
            sql: 'INSERT INTO payment_links (id, customer, amount, description, expiry, status, url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, customer, amount, description || null, expiry || null, 'Active', url]
        });
        const result = await db.execute({ sql: 'SELECT * FROM payment_links WHERE id = ?', args: [id] });
        return NextResponse.json({ link: result.rows[0] }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
