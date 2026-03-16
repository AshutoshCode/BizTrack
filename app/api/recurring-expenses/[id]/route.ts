import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { active } = await req.json();
        await db.execute({
            sql: 'UPDATE recurring_expenses SET active = ? WHERE id = ?',
            args: [active ? 1 : 0, id]
        });
        const result = await db.execute({ sql: 'SELECT * FROM recurring_expenses WHERE id = ?', args: [id] });
        const row: any = result.rows[0];
        const recurringExpense = { ...row, nextDate: row.next_date };
        return NextResponse.json({ recurringExpense });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        await db.execute({ sql: 'DELETE FROM recurring_expenses WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
