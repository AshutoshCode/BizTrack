import { createClient } from '@libsql/client';
import type { Client, ResultSet } from '@libsql/client';

// ── Local SQLite shim (mirrors @libsql/client interface) ──────────────────
function createLocalClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  const sqlite = new Database('biztrack.db');
  sqlite.pragma('journal_mode = WAL');   // better concurrent read performance
  sqlite.pragma('foreign_keys = ON');

  function runStatement(sql: string, args?: unknown[]): ResultSet {
    const stmt = sqlite.prepare(sql);
    const isQuery = sql.trimStart().toUpperCase().startsWith('SELECT');

    if (isQuery) {
      const rows = stmt.all(...(args ?? []));
      return { rows, rowsAffected: 0, lastInsertRowid: undefined } as unknown as ResultSet;
    } else {
      const info = stmt.run(...(args ?? []));
      return {
        rows: [],
        rowsAffected: info.changes,
        lastInsertRowid: info.lastInsertRowid,
      } as unknown as ResultSet;
    }
  }

  return {
    async execute(sql: string | { sql: string; args?: unknown[] }): Promise<ResultSet> {
      if (typeof sql === 'string') {
        return runStatement(sql);
      }
      return runStatement(sql.sql, sql.args);
    },

    async batch(stmts: Array<{ sql: string; args?: unknown[] }>): Promise<ResultSet[]> {
      const runAll = sqlite.transaction(() =>
        stmts.map(s => runStatement(s.sql, s.args))
      );
      return runAll();
    },
  } as unknown as Client;
}

// ── Export: cloud if env vars present, local SQLite otherwise ─────────────
const db = process.env.TURSO_URL
  ? createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  : createLocalClient();

export default db;
