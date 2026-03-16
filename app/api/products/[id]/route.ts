import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ProductSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        
        // Use partial schema to validate only the fields provided
        const validatedData = ProductSchema.partial().parse(body);
        const fields = Object.keys(validatedData);
        
        if (fields.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const sql = `UPDATE products SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
        const args = [...Object.values(validatedData), id] as any[];

        await db.execute({ sql, args });
        
        const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
        return NextResponse.json({ product: result.rows[0] });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
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
