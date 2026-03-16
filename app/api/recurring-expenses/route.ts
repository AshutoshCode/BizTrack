import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { RecurringExpenseSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM recurring_expenses', args: [] });
        const recurringExpenses = result.rows.map((row: any) => ({
            ...row,
            nextDate: row.next_date
        }));
        return NextResponse.json({ recurringExpenses });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = RecurringExpenseSchema.parse(body);
        const { description, amount, category, frequency, next_date, active } = validatedData;
        
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO recurring_expenses (id, description, amount, category, frequency, next_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, description, amount, category, frequency, next_date || null, active ? 1 : 0]
        });
        const result = await db.execute({ sql: 'SELECT * FROM recurring_expenses WHERE id = ?', args: [id] });
        const row: any = result.rows[0];
        const recurringExpense = { ...row, nextDate: row.next_date };
        return NextResponse.json({ recurringExpense }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
