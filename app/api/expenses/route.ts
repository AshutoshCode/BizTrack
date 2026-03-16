import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
        const { description, amount, category, date } = await req.json();
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            args: [id, description, amount, category, date]
        });
        const result = await db.execute({ sql: 'SELECT * FROM expenses WHERE id = ?', args: [id] });
        const expense = result.rows[0];
        return NextResponse.json({ expense }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
