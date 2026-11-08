import { createHash, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
export const tokenHash = value => createHash('sha256').update(value).digest('hex');
export function newAccessToken() {return randomBytes(32).toString('hex');}
export function authorized(row, token) {
 if (typeof token!=='string' || !/^[a-f0-9]{64}$/.test(token) || !row?.access_token_hash) return false;
 return timingSafeEqual(Buffer.from(tokenHash(token),'hex'),Buffer.from(row.access_token_hash,'hex'));
}
export function validPaystackSignature(raw, signature, secret) {
 if (!secret || typeof signature!=='string' || !/^[a-f0-9]{128}$/.test(signature)) return false;
 const digest=createHmac('sha512',secret).update(raw).digest();
 return timingSafeEqual(digest,Buffer.from(signature,'hex'));
}
