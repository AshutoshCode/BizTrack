import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const record = await base(AIRTABLE_TABLES.EXPENSES).find(params.id);
        return NextResponse.json(mapRecord(record));
    } catch (error) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();

        const updatedRecords = await base(AIRTABLE_TABLES.EXPENSES).update([
            {
                id: params.id,
                fields: {
                    Description: body.description,
                    Amount: parseFloat(body.amount),
                    Category: body.category,
                    Date: body.date,
                    Vendor: body.vendor,
                    Notes: body.notes
                }
            }
        ]);

        return NextResponse.json(mapRecord(updatedRecords[0]));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await base(AIRTABLE_TABLES.EXPENSES).destroy([params.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}
