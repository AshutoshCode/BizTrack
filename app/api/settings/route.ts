import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

import { SettingSchema } from '@/lib/schemas';
import { z } from 'zod';

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
        const stmts = [];
        
        for (const key of keys) {
            // Validate each setting
            const validated = SettingSchema.parse({ key, value: String(body[key]) });
            stmts.push({
                sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                args: [validated.key, validated.value]
            });
        }

        if (stmts.length > 0) {
            await db.batch(stmts, 'write');
        }
        
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
        }
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
