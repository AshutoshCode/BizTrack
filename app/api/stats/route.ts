import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';

const TO_FRONTEND: Record<string, string> = { UNPAID: 'Pending', PAID: 'Paid', LATE: 'Overdue' };

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'month', 'year', 'all', 'last_month'
    const grouping = searchParams.get('grouping') || 'monthly'; // 'monthly', 'weekly'

    let invoiceDateFilter = "";
    let expenseDateFilter = "";

    if (period === 'month') {
        invoiceDateFilter = " AND date_created >= date('now', 'start of month')";
        expenseDateFilter = " WHERE date >= date('now', 'start of month')";
    } else if (period === 'year') {
        invoiceDateFilter = " AND date_created >= date('now', 'start of year')";
        expenseDateFilter = " WHERE date >= date('now', 'start of year')";
    } else if (period === 'last_month') {
        invoiceDateFilter = " AND date_created >= date('now', 'start of month', '-1 month') AND date_created < date('now', 'start of month')";
        expenseDateFilter = " WHERE date >= date('now', 'start of month', '-1 month') AND date < date('now', 'start of month')";
    }

    const expenseWhere = expenseDateFilter ? expenseDateFilter : "";

    try {
        // totalRevenue: SUM total_amount WHERE status = 'PAID'
        const revRes = await db.execute({ 
            sql: `SELECT SUM(CAST(total_amount AS REAL)) as total FROM invoices WHERE status IN ('PAID', 'Paid')${invoiceDateFilter}`, 
            args: [] 
        });
        const totalRevenue = Number(revRes.rows[0]?.total || 0);

        // totalExpenses: SUM amount FROM expenses
        const expRes = await db.execute({ 
            sql: `SELECT SUM(CAST(amount AS REAL)) as total FROM expenses${expenseWhere}`, 
            args: [] 
        });
        const totalExpenses = Number(expRes.rows[0]?.total || 0);

        // unpaid
        const unpaidRes = await db.execute({ 
            sql: `SELECT COUNT(*) as count, SUM(CAST(total_amount AS REAL)) as total FROM invoices WHERE status IN ('UNPAID', 'Pending')${invoiceDateFilter}`, 
            args: [] 
        });
        const unpaidCount = Number(unpaidRes.rows[0]?.count || 0);
        const unpaidAmount = Number(unpaidRes.rows[0]?.total || 0);

        // overdue
        const overdueRes = await db.execute({ 
            sql: `SELECT COUNT(*) as count, SUM(CAST(total_amount AS REAL)) as total FROM invoices WHERE status IN ('LATE', 'Overdue')${invoiceDateFilter}`, 
            args: [] 
        });
        const overdueCount = Number(overdueRes.rows[0]?.count || 0);
        const overdueAmount = Number(overdueRes.rows[0]?.total || 0);

        // expensesByCategory
        const catRes = await db.execute({ 
            sql: `SELECT category, SUM(amount) as total FROM expenses${expenseWhere} GROUP BY category ORDER BY total DESC`, 
            args: [] 
        });
        const expensesByCategory = catRes.rows.map(r => ({ category: r.category, total: r.total }));

        // revenue & expenses grouping (last 6 months or last 12 weeks or last 5 years)
        let chartSql = "";
        let expChartSql = "";
        if (grouping === 'weekly') {
            chartSql = "SELECT strftime('%Y-W%W', date_created) as label, SUM(total_amount) as total FROM invoices WHERE status IN ('PAID', 'Paid') GROUP BY label ORDER BY label DESC LIMIT 12";
            expChartSql = "SELECT strftime('%Y-W%W', date) as label, SUM(amount) as total FROM expenses GROUP BY label ORDER BY label DESC LIMIT 12";
        } else if (grouping === 'yearly') {
            chartSql = "SELECT strftime('%Y', date_created) as label, SUM(total_amount) as total FROM invoices WHERE status IN ('PAID', 'Paid') GROUP BY label ORDER BY label DESC LIMIT 10";
            expChartSql = "SELECT strftime('%Y', date) as label, SUM(amount) as total FROM expenses GROUP BY label ORDER BY label DESC LIMIT 10";
        } else {
            chartSql = "SELECT strftime('%Y-%m', date_created) as label, SUM(total_amount) as total FROM invoices WHERE status IN ('PAID', 'Paid') GROUP BY label ORDER BY label DESC LIMIT 6";
            expChartSql = "SELECT strftime('%Y-%m', date) as label, SUM(amount) as total FROM expenses GROUP BY label ORDER BY label DESC LIMIT 6";
        }
        
        const chartRes = await db.execute({ sql: chartSql, args: [] });
        const revenueByPeriod = chartRes.rows.map(r => ({ label: r.label, total: r.total })).reverse();

        const expChartRes = await db.execute({ sql: expChartSql, args: [] });
        const expensesByPeriod = expChartRes.rows.map(r => ({ label: r.label, total: r.total })).reverse();

        // recentInvoices
        const recentRes = await db.execute({ 
            sql: `SELECT i.*, c.name as customer 
                  FROM invoices i 
                  LEFT JOIN customers c ON i.customer_id = c.id 
                  ORDER BY i.date_created DESC LIMIT 5`, 
            args: [] 
        });
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
            revenueByMonth: revenueByPeriod,
            expensesByMonth: expensesByPeriod,
            recentInvoices
        });
    } catch (e: unknown) {
        console.error('Stats API Error:', e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
