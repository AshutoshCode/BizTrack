import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quoteRes = await db.execute({ sql: 'SELECT * FROM quotes WHERE id = ?', args: [id] });
        if (quoteRes.rows.length === 0) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }
        const itemsRes = await db.execute({ sql: 'SELECT * FROM quote_items WHERE quote_id = ?', args: [id] });
        
        return NextResponse.json({ 
            quote: quoteRes.rows[0], 
            items: itemsRes.rows 
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        await db.execute({
            sql: 'UPDATE quotes SET status = ? WHERE id = ?',
            args: [status, id]
        });

        const quoteRes = await db.execute({ sql: 'SELECT * FROM quotes WHERE id = ?', args: [id] });
        return NextResponse.json({ quote: quoteRes.rows[0] });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.execute({ sql: 'DELETE FROM quote_items WHERE quote_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM quotes WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
