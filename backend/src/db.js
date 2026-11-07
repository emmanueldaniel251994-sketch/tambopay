import pg from 'pg';
let pool;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (!pool) pool = new pg.Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
  return pool;
}
export async function closePool() { if (pool) await pool.end(); pool=undefined; }
