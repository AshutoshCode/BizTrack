# Complete Walkthrough Guide

This document serves as the **Master Guide** for the BizTrack application. It covers everything from setting up your development environment to deploying the application to production.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: Version 18.17.0 or later (required for Next.js 14+). [Download Node.js](https://nodejs.org/)
- **Git**: For version control. [Download Git](https://git-scm.com/)
- **Code Editor**: We recommend [VS Code](https://code.visualstudio.com/).

## 2. Installation

1.  **Clone the Repository**:
    Open your terminal/command prompt and run:
    ```bash
    git clone https://github.com/your-username/biztrack.git
    cd biztrack
    ```

2.  **Install Dependencies**:
    Install the required Node.js packages:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

## 3. Configuration

### Environment Variables
Create a file named `.env.local` in the root directory. You can copy the example file:
```bash
cp .env.local.example .env.local
# On Windows Command Prompt: copy .env.local.example .env.local
```

If you plan to use **Airtable Integration** (optional), add your credentials to `.env.local`:
```env
AIRTABLE_API_KEY=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id
```
*See [AIRTABLE_GUIDE.md](AIRTABLE_GUIDE.md) for details on getting these keys.*

## 4. Database Setup

BizTrack uses **SQLite** for local data storage. You need to initialize the database with sample data before running the app.

Run the seed script:
```bash
node scripts/seed-db.js
```
*Output: "Database seeded successfully!"*

This will create a `biztrack.db` file in your project root.

**Note**: If you ever want to reset your data to the defaults, just run this command again. **Warning**: This will wipe all current data in the local database.

## 5. Running Locally

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
You should see the BizTrack dashboard with the sample data you just seeded.

## 6. Project Structure Overview

- **`app/`**: Contains the pages and API routes (Next.js App Router).
- **`components/`**: Reusable UI components like tables, buttons, and cards.
- **`lib/`**: Helper functions, including database configuration (`db.ts`) and Airtable logic (`airtable.ts`).
- **`scripts/`**: Scripts for database management (`seed-db.js`).
- **`data_import/`**: CSV files used for generating sample data or importing to Airtable.
- **`public/`**: Static images and assets.

## 7. Building for Production

To create an optimized production build:

1.  **Build**:
    ```bash
    npm run build
    ```
    This compiles the application and optimizes assets.

2.  **Start Production Server**:
    ```bash
    npm start
    ```
    The app will run on `http://localhost:3000` in production mode.

## 8. Deployment

We recommend deploying to **Vercel** or **Netlify**.

### Important Note on Database
Since this app uses a local SQLite file (`biztrack.db`), data **will not persist** on serverless platforms like Vercel/Netlify across standard deployments.
*   **For detailed deployment instructions and production database solutions, see [DEPLOYMENT.md](DEPLOYMENT.md).**

## 9. Troubleshooting

**Issue: "Error: generic-pool: valid resource found" or Database errors**
- **Fix**: Ensure you have run `node scripts/seed-db.js`. Use a dedicated database viewer (like "DB Browser for SQLite") to check if `biztrack.db` is valid.

**Issue: Missing Styles**
- **Fix**: Ensure Tailwind CSS is generating styles. Check if `postcss.config.mjs` and `tailwind.config.ts` exist. Try deleting the `.next` folder and running `npm run dev` again.

**Issue: Airtable Data Not Syncing**
- **Fix**: Verify your `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are correct in `.env.local`. Check the server console for specific error messages.
