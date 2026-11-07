import {getPool} from './db.js';
import {initializePaystack,verifyPaystack,paymentVerified} from './paystack.js';
export function checkoutEnabled() {return process.env.ENABLE_SANDBOX_CHECKOUT==='true' && process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_');}
export function validEmail(value) {return typeof value==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length<=254;}
export async function startCheckout(row,email) {
 if(!checkoutEnabled()) throw Object.assign(new Error('Sandbox checkout disabled'),{status:503});
 if(!validEmail(email)) throw Object.assign(new Error('Valid email is required'),{status:400});
 if(row.status!=='pending' && row.status!=='processing') throw Object.assign(new Error('Transaction cannot be checked out'),{status:409});
 if(row.checkout_url) return {authorizationUrl:row.checkout_url};
 const reference='TP-'+row.id;
 const result=await initializePaystack({email,amountKobo:Number(row.amount_kobo),reference,callbackUrl:process.env.CHECKOUT_CALLBACK_URL});
 if(result.reference!==reference || !result.authorization_url?.startsWith('https://checkout.paystack.com/')) throw Object.assign(new Error('Unexpected provider response'),{status:502});
 const updated=await getPool().query(`UPDATE transactions SET provider_reference=$1,checkout_url=$2,status='processing',updated_at=NOW() WHERE id=$3 AND status IN ('pending','processing') AND (provider_reference IS NULL OR provider_reference=$1) RETURNING *`,[reference,result.authorization_url,row.id]);
 if(!updated.rows.length) throw Object.assign(new Error('Checkout state conflict'),{status:409});
 return {authorizationUrl:updated.rows[0].checkout_url};
}
export async function confirmPayment(reference) {
 if(!checkoutEnabled()) throw Object.assign(new Error('Sandbox checkout disabled'),{status:503});
 const result=await getPool().query('SELECT * FROM transactions WHERE provider_reference=$1',[reference]);
 const row=result.rows[0];if(!row)return false;
 if(row.status==='paid')return true;
 const verified=await verifyPaystack(reference);
 if(!paymentVerified(verified,row))return false;
 const update=await getPool().query(`UPDATE transactions SET status='paid',paid_at=NOW(),updated_at=NOW() WHERE id=$1 AND status='processing' RETURNING id`,[row.id]);
 return update.rows.length>0;
}
