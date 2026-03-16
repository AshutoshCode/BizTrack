import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
    try {
        const tables = [
            'quote_items', 'quotes', 'time_entries', 'recurring_expenses',
            'payment_links', 'payments_received', 'invoice_items', 'invoices',
            'expenses', 'products', 'customers', 'settings'
        ];

        for (const table of tables) {
            await db.execute({ sql: `DELETE FROM ${table}`, args: [] });
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
