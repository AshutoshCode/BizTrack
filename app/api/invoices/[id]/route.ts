import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const record = await base(AIRTABLE_TABLES.INVOICES).find(params.id);

        // Parse items from JSON string
        const items = record.get('Items') ? JSON.parse(record.get('Items') as string) : [];

        const invoice = {
            ...mapRecord(record),
            items: items,
            // We might need customer details too. 
            // For now, frontend fetches separately or we rely on what's in the record.
        };

        return NextResponse.json(invoice);
    } catch (error) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();

        // Only updating status for now usually
        const fields: any = {};
        if (body.status) fields.Status = body.status;
        if (body.status === 'PAID') fields['Paid Date'] = new Date().toISOString().split('T')[0];

        const updatedRecords = await base(AIRTABLE_TABLES.INVOICES).update([
            {
                id: params.id,
                fields: fields
            }
        ]);

        return NextResponse.json(mapRecord(updatedRecords[0]));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await base(AIRTABLE_TABLES.INVOICES).destroy([params.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
}
