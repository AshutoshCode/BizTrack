import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({
        message: 'Data reset is disabled for Airtable backend. Please delete records directly in your Airtable Base to avoid API rate limits.'
    });
}
