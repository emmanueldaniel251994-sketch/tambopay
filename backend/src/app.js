import http from 'node:http';
import {validateOrder,validateIdempotencyKey} from './domain.js';
import {createTransaction,findTransaction,findAuthorizedRow} from './transactions.js';
import {startCheckout,confirmPayment,checkoutEnabled} from './checkout.js';
import {validPaystackSignature} from './security.js';
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(status===204?'':JSON.stringify(body));};
async function readBody(req,limit=16384) {
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('Payload too large'),{status:413});chunks.push(chunk);}
 return Buffer.concat(chunks);
}
function parseJson(raw){try{return JSON.parse(raw.toString('utf8'));}catch{throw Object.assign(new Error('Invalid JSON'),{status:400});}}
function bearer(req){const match=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization||'');return match?.[1]||'';}
export function createApp({create=createTransaction,find=findTransaction,findRow=findAuthorizedRow,checkout=startCheckout,confirm=confirmPayment}={}) {
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const allowed=(process.env.CORS_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(origin&&allowed.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Idempotency-Key, Authorization');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');}
  if(req.method==='OPTIONS')return json(res,origin&&allowed.includes(origin)?204:403,{});
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/health'&&req.method==='GET')return json(res,200,{status:'ok'});
   if(url.pathname==='/api/v1/transactions'&&req.method==='POST'){
    if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return json(res,415,{error:'JSON required'});
    const key=validateIdempotencyKey(req.headers['idempotency-key']);
    const order=validateOrder(parseJson(await readBody(req)));
    const result=await create(order,key);
    return result.conflict?json(res,409,{error:'Idempotency conflict'}):json(res,201,result);
   }
   const match=url.pathname.match(/^\/api\/v1\/transactions\/([0-9a-fA-F-]{36})(\/checkout)?$/);
   if(match&&req.method==='GET'&&!match[2]){
    const tx=await find(match[1],bearer(req));
    return tx?json(res,200,tx):json(res,404,{error:'Transaction not found'});
   }
   if(match&&match[2]&&req.method==='POST'){
    const row=await findRow(match[1],bearer(req));
    if(!row)return json(res,404,{error:'Transaction not found'});
    if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return json(res,415,{error:'JSON required'});
    const body=parseJson(await readBody(req));
    const result=await checkout(row,body.email);
    return json(res,200,result);
   }
   if(url.pathname==='/api/v1/webhooks/paystack'&&req.method==='POST'){
    if(!checkoutEnabled())return json(res,503,{error:'Sandbox checkout disabled'});
    const raw=await readBody(req,65536);
    if(!validPaystackSignature(raw,req.headers['x-paystack-signature'],process.env.PAYSTACK_SECRET_KEY))return json(res,401,{error:'Invalid signature'});
    const event=parseJson(raw);
    if(event.event==='charge.success'&&typeof event.data?.reference==='string')await confirm(event.data.reference);
    return json(res,200,{received:true});
   }
   return json(res,404,{error:'Not found'});
  }catch(e){
   if(e.status&&[400,409,413,502,503].includes(e.status))return json(res,e.status,{error:e.message});
   if(/^Invalid |^Amount must/.test(e.message))return json(res,400,{error:e.message});
   console.error('API request failed',e);
   return json(res,500,{error:'Internal server error'});
  }
 });
}
