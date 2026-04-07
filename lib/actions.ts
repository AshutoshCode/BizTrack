'use server';

import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
    const customerInput = formData.get('customerId') as string;
    const dateCreated = (formData.get('dateCreated') as string) || new Date().toISOString().slice(0, 10);
    const dueDate = formData.get('dueDate') as string;

    // Resolve customer ID (could be name or ID)
    let customerId = customerInput;
    const existing = await db.execute({ sql: 'SELECT id FROM customers WHERE id = ? OR name = ?', args: [customerInput, customerInput] });
    if (existing.rows.length > 0) {
        customerId = (existing.rows[0] as any).id;
    } else {
        customerId = uuidv4();
        await db.execute({ sql: 'INSERT INTO customers (id, name) VALUES (?, ?)', args: [customerId, customerInput] });
    }

    // Parse line items
    interface InvoiceItem {
        description: string;
        quantity: number;
        price: number;
    }
    const items: InvoiceItem[] = [];
    let i = 0;
    while (formData.has(`items[${i}].description`)) {
        items.push({
            description: formData.get(`items[${i}].description`) as string,
            quantity: Number(formData.get(`items[${i}].quantity`)),
            price: Number(formData.get(`items[${i}].price`)),
        });
        i++;
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const invoiceId = uuidv4();

    const stmts = [
        {
            sql: 'INSERT INTO invoices (id, customer_id, date_created, due_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
            args: [invoiceId, customerId, dateCreated, dueDate, 'UNPAID', totalAmount]
        }
    ];

    for (const item of items) {
        stmts.push({
            sql: 'INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [uuidv4(), invoiceId, null as any, item.description, item.quantity, item.price, item.quantity * item.price]
        });
    }

    await db.batch(stmts, 'write');

    revalidatePath('/invoices');
    revalidatePath('/');
    redirect('/invoices');
}

export async function createExpense(formData: FormData) {
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;

    await db.execute({
        sql: 'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
        args: [uuidv4(), description, amount, category, date]
    });

    revalidatePath('/expenses');
}

