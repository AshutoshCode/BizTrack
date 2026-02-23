import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET() {
    try {
        const records = await base(AIRTABLE_TABLES.EXPENSES).select({
            sort: [{ field: 'Date', direction: 'desc' }]
        }).all();

        return NextResponse.json(records.map(mapRecord));
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.description || !body.amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const createdRecords = await base(AIRTABLE_TABLES.EXPENSES).create([
            {
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

        return NextResponse.json(mapRecord(createdRecords[0]), { status: 201 });
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}
