const API='https://api.paystack.co';
async function request(path,options={}) {
 const secret=process.env.PAYSTACK_SECRET_KEY;
 if (!secret || !secret.startsWith('sk_test_')) throw Object.assign(new Error('Paystack sandbox is not configured'),{status:503});
 const response=await fetch(API+path,{...options,headers:{authorization:'Bearer '+secret,'content-type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(10000)});
 const data=await response.json();
 if (!response.ok || !data.status) throw Object.assign(new Error('Payment provider request failed'),{status:502});
 return data.data;
}
export async function initializePaystack({email,amountKobo,reference,callbackUrl}) {
 return request('/transaction/initialize',{method:'POST',body:JSON.stringify({email,amount:amountKobo,reference,callback_url:callbackUrl})});
}
export async function verifyPaystack(reference) {return request('/transaction/verify/'+encodeURIComponent(reference));}
export function paymentVerified(data,row) {
 return data?.status==='success' && data.reference===row.provider_reference && data.currency==='NGN' && Number(data.amount)===Number(row.amount_kobo);
}
