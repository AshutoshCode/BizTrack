import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET() {
    try {
        const records = await base(AIRTABLE_TABLES.INVOICES).select({
            sort: [{ field: 'Date Created', direction: 'desc' }] // Ensure field name matches Airtable
        }).all();

        // We need customer names. In Airtable, if 'Customer' is a linked record, 
        // the API returns an array of IDs. We might need to fetch customers or use a Lookup field in Airtable 
        // that brings the name into the Invoices table.
        // For MVP, let's assume the frontend might just show ID or we rely on a "Customer Name" lookup field in Airtable.
        // Let's assume there is a 'Customer Name' lookup field for simplicity.

        const mapped = records.map(r => ({
            ...mapRecord(r),
            customer_name: r.get('Customer Name') ? (r.get('Customer Name') as any[])[0] : 'Unknown', // Lookup fields return arrays
            item_count: r.get('Items') ? JSON.parse(r.get('Items') as string).length : 0
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Calculate total on server or trust client? Trust client for MVP but safer to calc.
        // We will store items as a JSON string in a text field for simplicity as per plan.
        const itemsJson = JSON.stringify(body.items);

        const createdRecords = await base(AIRTABLE_TABLES.INVOICES).create([
            {
                fields: {
                    Customer: [body.customer_id], // Linked record requires array of IDs
                    'Date Created': body.date_created,
                    'Due Date': body.due_date,
                    Status: body.status,
                    'Total Amount': body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
                    Notes: body.notes,
                    Items: itemsJson
                }
            }
        ]);

        return NextResponse.json(mapRecord(createdRecords[0]), { status: 201 });
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
}
