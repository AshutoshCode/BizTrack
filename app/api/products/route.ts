import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET() {
    try {
        const records = await base(AIRTABLE_TABLES.PRODUCTS).select({
            sort: [{ field: 'Name', direction: 'asc' }]
        }).all();

        return NextResponse.json(records.map(mapRecord));
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const createdRecords = await base(AIRTABLE_TABLES.PRODUCTS).create([
            {
                fields: {
                    Name: body.name,
                    Description: body.description,
                    Price: parseFloat(body.price),
                    Unit: body.unit,
                    Active: body.active
                }
            }
        ]);

        return NextResponse.json(mapRecord(createdRecords[0]), { status: 201 });
    } catch (error) {
        console.error('Airtable Error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
