import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json(); // Fixed: req.json() -> request.json()
        
        // Should ideally be in a transaction but we'll do sequential for simplicity if not heavily constrained
        const fields = Object.keys(body); // Fixed: lds = Object.keys(body) -> const fields = Object.keys(body)
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
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
