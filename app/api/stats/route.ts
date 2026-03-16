import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TO_FRONTEND: Record<string, string> = { UNPAID: 'Pending', PAID: 'Paid', LATE: 'Overdue' };

export async function GET() {
    try {
        // totalRevenue: SUM total_amount WHERE status = 'PAID'
        const revRes = await db.execute({ sql: "SELECT SUM(total_amount) as total FROM invoices WHERE status = 'PAID'", args: [] });
        const totalRevenue = Number(revRes.rows[0]?.total || 0);

        // totalExpenses: SUM amount FROM expenses
        const expRes = await db.execute({ sql: "SELECT SUM(amount) as total FROM expenses", args: [] });
        const totalExpenses = Number(expRes.rows[0]?.total || 0);

        // unpaid
        const unpaidRes = await db.execute({ sql: "SELECT COUNT(*) as count, SUM(total_amount) as total FROM invoices WHERE status = 'UNPAID'", args: [] });
        const unpaidCount = Number(unpaidRes.rows[0]?.count || 0);
        const unpaidAmount = Number(unpaidRes.rows[0]?.total || 0);

        // overdue
        const overdueRes = await db.execute({ sql: "SELECT COUNT(*) as count, SUM(total_amount) as total FROM invoices WHERE status = 'LATE'", args: [] });
        const overdueCount = Number(overdueRes.rows[0]?.count || 0);
        const overdueAmount = Number(overdueRes.rows[0]?.total || 0);

        // expensesByCategory
        const catRes = await db.execute({ sql: "SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC", args: [] });
        const expensesByCategory = catRes.rows.map(r => ({ category: r.category, total: r.total }));

        // revenueByMonth (last 6 months)
        const monthRes = await db.execute({ 
            sql: "SELECT strftime('%Y-%m', date_created) as month, SUM(total_amount) as total FROM invoices WHERE status = 'PAID' GROUP BY month ORDER BY month DESC LIMIT 6", 
            args: [] 
        });
        const revenueByMonth = monthRes.rows.map(r => ({ month: r.month, total: r.total })).reverse();

        // recentInvoices
        const recentRes = await db.execute({ sql: "SELECT * FROM invoices ORDER BY date_created DESC LIMIT 5", args: [] });
        const recentInvoices = recentRes.rows.map((inv: any) => ({
            ...inv,
            status: TO_FRONTEND[inv.status] || inv.status,
            amount: inv.total_amount,
            dueDate: inv.due_date,
        }));

        return NextResponse.json({
            totalRevenue,
            totalExpenses,
            unpaidCount,
            unpaidAmount,
            overdueCount,
            overdueAmount,
            expensesByCategory,
            revenueByMonth,
            recentInvoices
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
