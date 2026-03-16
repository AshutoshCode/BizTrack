import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { active } = await request.json();
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
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await db.execute({ sql: 'DELETE FROM recurring_expenses WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
