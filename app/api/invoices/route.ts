import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const TO_FRONTEND: Record<string, string> = { UNPAID: 'Pending', PAID: 'Paid', LATE: 'Overdue' };
const TO_DB: Record<string, string>       = { Pending: 'UNPAID', Paid: 'PAID', Overdue: 'LATE' };

function mapInvoice(inv: any) {
    if (!inv) return inv;
    return {
        ...inv,
        status: TO_FRONTEND[inv.status] || inv.status,
        amount: inv.total_amount, // frontend expects .amount
        dueDate: inv.due_date,    // frontend expects .dueDate
    };
}

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM invoices ORDER BY date_created DESC', args: [] });
        const invoices = result.rows.map(mapInvoice);
        return NextResponse.json({ invoices });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { customer, dueDate, amount, items, date } = await req.json();
        const id = uuidv4();
        const dateCreated = date || new Date().toISOString().slice(0, 10);
        const dbStatus = 'UNPAID';

        await db.execute({
            sql: 'INSERT INTO invoices (id, customer, date_created, due_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, customer, dateCreated, dueDate, dbStatus, amount]
        });

        if (Array.isArray(items)) {
            for (const item of items) {
                await db.execute({
                    sql: 'INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    args: [uuidv4(), id, null, item.description, item.quantity, item.price, item.quantity * item.price]
                });
            }
        }

        const result = await db.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [id] });
        const invoice = mapInvoice(result.rows[0]);
        return NextResponse.json({ invoice }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
