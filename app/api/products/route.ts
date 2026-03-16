import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ProductSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM products ORDER BY name ASC', args: [] });
        return NextResponse.json({ products: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = ProductSchema.parse(body);
        const { name, price, unit, category, quantity } = validatedData;
        
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO products (id, name, price, unit, category, quantity) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, name, price, unit || null, category || null, quantity]
        });
        const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
        const product = result.rows[0];
        return NextResponse.json({ product }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
