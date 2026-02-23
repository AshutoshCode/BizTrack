import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
    console.warn('Missing Airtable credentials in .env.local');
}

const base = new Airtable({ apiKey: apiKey || 'MISSING_KEY' }).base(baseId || 'MISSING_BASE');

export default base;

export const AIRTABLE_TABLES = {
    CUSTOMERS: 'Customers',
    PRODUCTS: 'Products',
    EXPENSES: 'Expenses',
    INVOICES: 'Invoices',
    INVOICE_ITEMS: 'Invoice Items',
};

// Helper to map Airtable record to our app's data shape
export const mapRecord = (record: any) => ({
    id: record.id,
    ...record.fields,
});
