import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM expenses ORDER BY date DESC', args: [] });
        return NextResponse.json({ expenses: result.rows });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = ExpenseSchema.parse(body);
        const { description, amount, category, date } = validatedData;
        
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            args: [id, description, amount, category, date]
        });
        const result = await db.execute({ sql: 'SELECT * FROM expenses WHERE id = ?', args: [id] });
        const expense = result.rows[0];
        return NextResponse.json({ expense }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
