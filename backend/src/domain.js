import { createHash } from 'node:crypto';
export const SERVICES = Object.freeze(['airtime','data','electricity','cable','education','other']);
export const STATUSES = Object.freeze(['pending','processing','paid','failed','cancelled']);
export function validateOrder(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body');
  const { service, customerReference, amount } = body;
  if (!SERVICES.includes(service)) throw new Error('Invalid service');
  if (typeof customerReference !== 'string' || !/^[a-zA-Z0-9+._ -]{5,60}$/.test(customerReference.trim())) throw new Error('Invalid customer reference');
  if (typeof amount !== 'string' || !/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(amount)) throw new Error('Amount must be a decimal string with at most two fractional digits');
  const [whole, fraction=''] = amount.split('.');
  const amountKobo = Number(whole)*100 + Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(amountKobo) || amountKobo < 10000 || amountKobo > 100000000) throw new Error('Amount must be between NGN 100 and NGN 1,000,000');
  return { service, customerReference:customerReference.trim(), amountKobo, currency:'NGN' };
}
export function validateIdempotencyKey(key) {
  if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{16,128}$/.test(key)) throw new Error('Invalid Idempotency-Key header');
  return key;
}
export function hashOrder(order) { return createHash('sha256').update(JSON.stringify(order)).digest('hex'); }
export function publicTransaction(row) {
  return {id:row.id,service:row.service,amountKobo:Number(row.amount_kobo),currency:row.currency,status:row.status,createdAt:row.created_at};
}
