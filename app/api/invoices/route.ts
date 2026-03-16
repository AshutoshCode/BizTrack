import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceSchema } from '@/lib/schemas';
import { z } from 'zod';

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
        const body = await req.json();
        const validatedData = InvoiceSchema.parse(body);
        const { customer, dateCreated, dueDate, items } = validatedData;
        
        const safeItems = items ?? [];
        const totalAmount = safeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const invoiceId = uuidv4();
        const dbStatus = 'UNPAID';

        const stmts = [
            {
                sql: 'INSERT INTO invoices (id, customer, date_created, due_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
                args: [invoiceId, customer, dateCreated || null, dueDate || null, dbStatus, totalAmount]
            }
        ];

        for (const item of safeItems) {
            stmts.push({
                sql: 'INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), invoiceId, null as any, item.description, item.quantity, item.price, item.quantity * item.price]
            });
        }

        await db.batch(stmts, 'write');

        const result = await db.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [invoiceId] });
        const invoice = mapInvoice(result.rows[0]);
        return NextResponse.json({ invoice }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
