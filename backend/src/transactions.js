import {randomUUID} from 'node:crypto';
import {getPool} from './db.js';
import {hashOrder,publicTransaction} from './domain.js';
import {newAccessToken,tokenHash,authorized} from './security.js';
export async function createTransaction(order,key) {
 const hash=hashOrder(order),accessToken=newAccessToken();
 const inserted=await getPool().query(
  `INSERT INTO transactions (id,idempotency_key,request_hash,service,customer_reference,amount_kobo,currency,access_token_hash)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (idempotency_key) DO NOTHING RETURNING *`,
  [randomUUID(),key,hash,order.service,order.customerReference,order.amountKobo,order.currency,tokenHash(accessToken)]);
 if(inserted.rows.length) return {transaction:publicTransaction(inserted.rows[0]),accessToken};
 const existing=await getPool().query('SELECT * FROM transactions WHERE idempotency_key=$1',[key]);
 const row=existing.rows[0];
 if(!row || row.request_hash!==hash)return {conflict:true};
 // Replays never reveal the original bearer token. The caller must retain it.
 return {transaction:publicTransaction(row)};
}
export async function findTransaction(id,accessToken) {
 const result=await getPool().query('SELECT * FROM transactions WHERE id=$1',[id]);
 const row=result.rows[0];
 return authorized(row,accessToken)?publicTransaction(row):null;
}
export async function findAuthorizedRow(id,accessToken) {
 const result=await getPool().query('SELECT * FROM transactions WHERE id=$1',[id]);
 return authorized(result.rows[0],accessToken)?result.rows[0]:null;
}
