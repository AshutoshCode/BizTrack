import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM time_entries ORDER BY date DESC', args: [] });
        const timeEntries = result.rows.map((row: any) => ({
            ...row,
            invoice: row.invoice_id
        }));
        return NextResponse.json({ timeEntries });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { project, date, hours, billable, invoice } = await req.json();
        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO time_entries (id, project, date, hours, billable, invoice_id) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, project, date, hours, billable ? 1 : 0, invoice]
        });
        const result = await db.execute({ sql: 'SELECT * FROM time_entries WHERE id = ?', args: [id] });
        const row: any = result.rows[0];
        const timeEntry = { ...row, invoice: row.invoice_id };
        return NextResponse.json({ timeEntry }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
