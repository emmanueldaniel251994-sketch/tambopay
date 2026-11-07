import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';
import { hashOrder, publicTransaction } from './domain.js';
export async function createTransaction(order, key) {
  const hash = hashOrder(order);
  const result = await getPool().query(
    `INSERT INTO transactions (id,idempotency_key,request_hash,service,customer_reference,amount_kobo,currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key
     RETURNING *`,
    [randomUUID(),key,hash,order.service,order.customerReference,order.amountKobo,order.currency]
  );
  const row = result.rows[0];
  if (row.request_hash !== hash) return {conflict:true};
  return {transaction:publicTransaction(row)};
}
export async function findTransaction(id) {
  const result = await getPool().query('SELECT * FROM transactions WHERE id=$1',[id]);
  return result.rows[0] ? publicTransaction(result.rows[0]) : null;
}
