import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'biztrack.db');

// Allow the connection to be cached in development to prevent multiple connections
// during hot reloading
declare global {
    var sqlite: Database.Database | undefined;
}

const db = global.sqlite || new Database(dbPath);

if (process.env.NODE_ENV === 'development') {
    global.sqlite = db;
}

export default db;
