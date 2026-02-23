import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const record = await base(AIRTABLE_TABLES.PRODUCTS).find(params.id);
        return NextResponse.json(mapRecord(record));
    } catch (error) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();

        const updatedRecords = await base(AIRTABLE_TABLES.PRODUCTS).update([
            {
                id: params.id,
                fields: {
                    Name: body.name,
                    Description: body.description,
                    Price: parseFloat(body.price),
                    Unit: body.unit,
                    Active: body.active
                }
            }
        ]);

        return NextResponse.json(mapRecord(updatedRecords[0]));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await base(AIRTABLE_TABLES.PRODUCTS).destroy([params.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
