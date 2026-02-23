# Airtable Guide

BizTrack supports optional integration with Airtable to sync your data.

## Quick Setup with CSV Import

To get started quickly, we have provided pre-formatted CSV files with sample data in the `data_import/` folder.

1. **Create Base**: Create a new empty base in Airtable.
2. **Import CSVs**:
   - In your new base, click "Add or import" (usually next to the table tabs).
   - Select "CSV file".
   - Upload the files in the following order to maintain relationships:
     1. `Customers.csv` -> Create a new table named "Customers".
     2. `Products.csv` -> Create a new table named "Products".
     3. `Expenses.csv` -> Create a new table named "Expenses".
     4. `Invoices.csv` -> Create a new table named "Invoices".
     5. `InvoiceItems.csv` -> Create a new table named "Invoice Items".

3. **Link Records**:
   - **Invoices Table**: Convert the `customer_id` column type to "Link to another record" -> "Customers".
   - **Invoice Items Table**:
     - Convert `invoice_id` to "Link to another record" -> "Invoices".
     - Convert `product_id` to "Link to another record" -> "Products".

## Manual Setup

If you prefer to set up manually or verify the structure, here are the required schemas.

### Customers Table
- `id` (Single line text)
- `name` (Single line text)
- `email` (Email)
- `phone` (Phone number)
- `address` (Single line text)

### Products Table
- `id` (Single line text)
- `name` (Single line text)
- `price` (Number)
- `unit` (Single line text)
- `active` (Checkbox)

### Expenses Table
- `id` (Single line text)
- `description` (Single line text)
- `amount` (Number)
- `category` (Single line text)
- `date` (Date)

### Invoices Table
- `id` (Single line text)
- `customer_id` (Link to Customers)
- `date_created` (Date)
- `due_date` (Date)
- `status` (Single select: Paid, Unpaid, Late)
- `total_amount` (Number)
- `paid_date` (Date)

### Invoice Items Table
- `id` (Single line text)
- `invoice_id` (Link to Invoices)
- `product_id` (Link to Products)
- `description` (Single line text)
- `quantity` (Number)
- `price` (Number)
- `total` (Number)

## Environment Configuration

1. **Get API Key**:
   - Go to your Airtable Account settings.
   - Generate a Personal Access Token with `data.records:read` and `data.records:write` scopes.

2. **Get Base ID**:
   - The Base ID is the first part of the URL when viewing your base (starts with `app...`).

3. **Update Environment Variables**:
   Add the following to your `.env.local` file:
   ```env
   AIRTABLE_API_KEY=your_api_key
   AIRTABLE_BASE_ID=your_base_id
   ```
