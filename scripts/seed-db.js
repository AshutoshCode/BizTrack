const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(process.cwd(), 'biztrack.db');
const db = new Database(dbPath);

function seed() {
    console.log('Seeding database...');

    // Customers
    const customers = [
        { id: uuidv4(), name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0101', address: '123 Industrial Way' },
        { id: uuidv4(), name: 'Jane Doe Designs', email: 'jane@designs.com', phone: '555-0102', address: '456 creative Blvd' },
        { id: uuidv4(), name: 'Global Tech', email: 'accounts@globaltech.com', phone: '555-0103', address: '789 Tech Park' },
    ];

    const insertCustomer = db.prepare('INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)');
    customers.forEach(c => insertCustomer.run(c.id, c.name, c.email, c.phone, c.address));

    // Products
    const products = [
        { id: uuidv4(), name: 'Web Design', price: 1500, unit: 'project', active: 1 },
        { id: uuidv4(), name: 'SEO Consultation', price: 150, unit: 'hour', active: 1 },
        { id: uuidv4(), name: 'Hosting Maintenance', price: 50, unit: 'month', active: 1 },
    ];

    const insertProduct = db.prepare('INSERT INTO products (id, name, price, unit, active) VALUES (?, ?, ?, ?, ?)');
    products.forEach(p => insertProduct.run(p.id, p.name, p.price, p.unit, p.active));

    // Expenses
    const expenses = [
        { id: uuidv4(), description: 'Office Rent', amount: 1200, category: 'Rent', date: new Date().toISOString().split('T')[0] },
        { id: uuidv4(), description: 'Internet Bill', amount: 85, category: 'Utilities', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0] },
        { id: uuidv4(), description: 'Adobe CC Subscription', amount: 55, category: 'Software', date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0] },
    ];

    const insertExpense = db.prepare('INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)');
    expenses.forEach(e => insertExpense.run(e.id, e.description, e.amount, e.category, e.date));

    // Invoices (Transactions)
    const invoiceId1 = uuidv4();
    const invoiceId2 = uuidv4();

    // Invoice 1: Paid
    db.prepare(`
    INSERT INTO invoices (id, customer_id, date_created, due_date, status, total_amount, paid_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
        invoiceId1,
        customers[0].id,
        new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        'PAID',
        1500,
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]
    );

    db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), invoiceId1, products[0].id, products[0].name, 1, products[0].price, products[0].price);

    // Invoice 2: Unpaid/Late
    db.prepare(`
    INSERT INTO invoices (id, customer_id, date_created, due_date, status, total_amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
        invoiceId2,
        customers[1].id,
        new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // Late
        'LATE',
        300
    );

    db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, price, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), invoiceId2, products[1].id, products[1].name, 2, products[1].price, 300);

    console.log('Database seeded successfully!');
}

seed();
