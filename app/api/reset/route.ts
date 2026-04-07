import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
    try {
        const tables = [
            'invoice_items', 'payments_received', 'payment_links', 'invoices',
            'quote_items', 'quotes', 'time_entries', 
            'recurring_expenses', 'expenses', 
            'delivery_challans', 'retainer_invoices', 'subscriptions',
            'products', 'customers', 'settings'
        ];

        const statements = [
            { sql: 'PRAGMA foreign_keys = OFF' },
            ...tables.map(table => ({ sql: `DELETE FROM ${table}` })),
            { sql: 'PRAGMA foreign_keys = ON' }
        ];

        await db.batch(statements);

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
