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
        const result = await db.execute({ 
            sql: `
                SELECT 
                    invoices.*, 
                    customers.name as customer 
                FROM invoices 
                LEFT JOIN customers ON invoices.customer_id = customers.id 
                ORDER BY invoices.date_created DESC
            `, 
            args: [] 
        });
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
        const { customer: customerName, dateCreated, dueDate, items, status: rawStatus } = validatedData;
        
        // Resolve or create customer
        let customerId;
        const existingCust = await db.execute({ 
            sql: 'SELECT id FROM customers WHERE name = ?', 
            args: [customerName] 
        });
        
        if (existingCust.rows.length > 0) {
            customerId = (existingCust.rows[0] as any).id;
        } else {
            customerId = uuidv4();
            await db.execute({ 
                sql: 'INSERT INTO customers (id, name) VALUES (?, ?)', 
                args: [customerId, customerName] 
            });
        }

        const safeItems = items ?? [];
        let totalAmount = safeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        // If items are empty, use the top-level amount field if provided
        if (safeItems.length === 0 && body.amount !== undefined) {
            totalAmount = body.amount;
        }

        const invoiceId = uuidv4();
        const finalDateCreated = dateCreated || new Date().toISOString().split('T')[0];
        const normalisedStatus = (rawStatus ? TO_DB[rawStatus] : null) || (body.status ? TO_DB[body.status] : null) || 'UNPAID';

        const stmts = [
            {
                sql: 'INSERT INTO invoices (id, customer_id, date_created, due_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
                args: [invoiceId, customerId, finalDateCreated, dueDate || null, normalisedStatus, totalAmount]
            }

        ];

        for (const item of safeItems) {
            stmts.push({
                sql: 'INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), invoiceId, null as any, item.description, item.quantity, item.price, item.quantity * item.price]
            });
        }

        await db.batch(stmts, 'write');

        const result = await db.execute({ 
            sql: 'SELECT invoices.*, customers.name as customer FROM invoices JOIN customers ON invoices.customer_id = customers.id WHERE invoices.id = ?', 
            args: [invoiceId] 
        });
        const invoice = mapInvoice(result.rows[0]);
        return NextResponse.json({ invoice }, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
