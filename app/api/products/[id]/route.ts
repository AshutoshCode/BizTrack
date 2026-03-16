import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const fields = Object.keys(body);
        if (fields.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const sql = `UPDATE products SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
        const args = [...Object.values(body), id] as any[];

        await db.execute({ sql, args });
        
        const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
        return NextResponse.json({ product: result.rows[0] });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
