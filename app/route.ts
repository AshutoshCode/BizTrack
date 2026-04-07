import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    const filePath = join(process.cwd(), 'lib/frontend.html');
    const fileParams = await readFile(filePath, 'utf-8');

    return new NextResponse(fileParams, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
