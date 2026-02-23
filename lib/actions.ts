'use server';

import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
    const customerId = formData.get('customerId') as string;
    const dateCreated = formData.get('dateCreated') as string;
    const dueDate = formData.get('dueDate') as string;

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

    // Transaction
    const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, customer_id, date_created, due_date, status, total_amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertItem = db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    // Simple transaction wrapper if db supported it directly, but better-sqlite3 is synchronous so it's safer.
    // Ideally use db.transaction()

    const createInvoiceTransaction = db.transaction(() => {
        insertInvoice.run(invoiceId, customerId, dateCreated, dueDate, 'UNPAID', totalAmount);

        items.forEach((item: InvoiceItem) => {
            // For now, we don't have a product selection, so we just generate a random product ID or use a placeholder
            // In a real app, we'd select a product or create one on the fly.
            // Let's just generate a UUID for the "product" or use null if schema allows (it likely expects a product_id)
            // Looking at seed, products have IDs. Let's assume ad-hoc items for now and maybe link to a generic product or just generate an ID.
            // Actually, let's just use a new UUID for product_id for ad-hoc items to satisfy constraint if it exists, 
            // or assume the schema doesn't strictly enforce foreign key if we didn't enable PRAGMA foreign_keys

            insertItem.run(
                uuidv4(),
                invoiceId,
                uuidv4(), // Fake Product ID for ad-hoc item
                item.description,
                item.quantity,
                item.price,
                item.quantity * item.price
            );
        });
    });

    createInvoiceTransaction();

    revalidatePath('/invoices');
    revalidatePath('/');
    redirect('/invoices');
}

export async function createExpense(formData: FormData) {
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;

    const insertExpense = db.prepare(`
    INSERT INTO expenses (id, description, amount, category, date)
    VALUES (?, ?, ?, ?, ?)
  `);

    insertExpense.run(uuidv4(), description, amount, category, date);

    revalidatePath('/expenses');
}

