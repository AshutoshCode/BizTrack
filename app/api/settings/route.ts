import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute({ sql: 'SELECT * FROM settings', args: [] });
        const settings: Record<string, any> = {};
        result.rows.forEach((row: any) => {
            settings[row.key] = row.value;
        });
        return NextResponse.json(settings);
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const keys = Object.keys(body);
        
        for (const key of keys) {
            await db.execute({
                sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                args: [key, String(body[key])]
            });
        }
        
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
