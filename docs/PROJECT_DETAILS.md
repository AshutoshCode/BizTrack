# BizTrack - Project Details

## Overview
BizTrack is a simple, no-code friendly web application designed for small businesses to track unpaid and late invoices. It also includes basic expense tracking capabilities. The application is built to be easily deployable and maintainable.

## Key Features
- **Invoice Management**: Create, view, and manage invoices.
- **Status Tracking**: Automatically track invoice status (Paid, Unpaid, Late).
- **Expense Tracking**: Log and categorize business expenses.
- **Dashboard**: View key metrics like total outstanding revenue and recent activity.
- **Data Persistence**: Uses SQLite for local development and can be configured for other SQL databases.
- **Airtable Integration**: Optional integration to sync data with Airtable for easier management.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Language**: TypeScript
- **Icons**: [Lucide React](https://lucide.dev/)
- **External Integration**: [Airtable](https://airtable.com/)

## Directory Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components.
- `lib/`: Utility functions and database configurations.
- `scripts/`: Database seeding and initialization scripts.
- `data_import/`: CSV files for initial data import.
- `public/`: Static assets.

## Database Schema
The application uses the following main entities:
- **Customers**: Client information.
- **Products**: Services or goods offered.
- **Invoices**: Transaction records linking customers and products.
- **Expenses**: Business operational costs.
