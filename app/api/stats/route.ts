import { NextResponse } from 'next/server';
import base, { AIRTABLE_TABLES, mapRecord } from '@/lib/airtable';

export async function GET() {
    try {
        // We need to fetch all invoices and expenses to calculate stats.
        // This is inefficient but standard for MVP with Airtable API limits (100 records per page).
        // For larger datasets, we would need pagination or Rollup fields in a separate 'Stats' table.

        const [invoices, expenses] = await Promise.all([
            base(AIRTABLE_TABLES.INVOICES).select().all(),
            base(AIRTABLE_TABLES.EXPENSES).select().all()
        ]);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const revenue = invoices
            .filter(r => r.get('Status') === 'PAID')
            .filter(r => {
                const d = new Date(r.get('Paid Date') as string);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, r) => sum + (r.get('Total Amount') as number || 0), 0);

        const expenseTotal = expenses
            .filter(r => {
                const d = new Date(r.get('Date') as string);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, r) => sum + (r.get('Amount') as number || 0), 0);

        const owed = invoices
            .filter(r => r.get('Status') !== 'PAID')
            .reduce((sum, r) => sum + (r.get('Total Amount') as number || 0), 0);

        // Recent activity
        const recentInvoices = invoices.slice(0, 5).map(r => ({
            type: 'INVOICE',
            description: `Invoice #${r.id.slice(0, 5)}`, // ID is long in Airtable
            amount: r.get('Total Amount'),
            date: r.get('Date Issued') || r.get('Date Created')
        }));

        const recentExpenses = expenses.slice(0, 5).map(r => ({
            type: 'EXPENSE',
            description: r.get('Description'),
            amount: r.get('Amount'),
            date: r.get('Date')
        }));

        const activity = [...recentInvoices, ...recentExpenses]
            .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
            .slice(0, 5);

        const alerts = invoices.filter(r => r.get('Status') === 'LATE').length;

        return NextResponse.json({
            revenue,
            expenses: expenseTotal,
            netProfit: revenue - expenseTotal,
            owed,
            activity,
            alerts
        });
    } catch (error) {
        console.error('Stats Error', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
