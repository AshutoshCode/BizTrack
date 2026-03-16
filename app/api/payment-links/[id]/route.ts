import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        await db.execute({ sql: 'DELETE FROM payment_links WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
