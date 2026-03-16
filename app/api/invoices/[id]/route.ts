import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const TO_FRONTEND: Record<string, string> = { UNPAID: 'Pending', PAID: 'Paid', LATE: 'Overdue' };
const TO_DB: Record<string, string>       = { Pending: 'UNPAID', Paid: 'PAID', Overdue: 'LATE' };

function mapInvoice(inv: any) {
    if (!inv) return inv;
    return {
        ...inv,
        status: TO_FRONTEND[inv.status] || inv.status,
        amount: inv.total_amount,
        dueDate: inv.due_date,
    };
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const invRes = await db.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [id] });
        if (invRes.rows.length === 0) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
        const itemsRes = await db.execute({ sql: 'SELECT * FROM invoice_items WHERE invoice_id = ?', args: [id] });
        
        return NextResponse.json({ 
            invoice: mapInvoice(invRes.rows[0]), 
            items: itemsRes.rows 
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { status } = await request.json();
        const dbStatus = TO_DB[status] || status;

        await db.execute({
            sql: 'UPDATE invoices SET status = ? WHERE id = ?',
            args: [dbStatus, id]
        });

        const invRes = await db.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [id] });
        return NextResponse.json({ invoice: mapInvoice(invRes.rows[0]) });
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
        // Should ideally be in a transaction but we'll do sequential for simplicity if not heavily constrained
        await db.execute({ sql: 'DELETE FROM invoice_items WHERE invoice_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM invoices WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
