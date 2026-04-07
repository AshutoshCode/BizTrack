import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { CustomerSchema } from '@/lib/schemas';
import { z } from 'zod';

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
        const body = await req.json();
        const validatedData = CustomerSchema.parse(body);
        const { name, email, phone, address, status } = validatedData;
        
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO customers (id, name, email, phone, address, status) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, name, email || null, phone || null, address || null, status || 'Active']
        });
        const result = await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [id] });
        const customer = result.rows[0];
        return NextResponse.json({ customer }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
