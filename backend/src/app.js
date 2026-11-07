import http from 'node:http';
import { validateOrder, validateIdempotencyKey } from './domain.js';
import { createTransaction, findTransaction } from './transactions.js';
const json=(res,status,body,extra={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra});res.end(JSON.stringify(body));};
async function readJson(req) {
  const chunks=[];let size=0;
  for await (const chunk of req) {size+=chunk.length;if(size>16384){const e=new Error('Payload too large');e.status=413;throw e;}chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{const e=new Error('Invalid JSON');e.status=400;throw e;}
}
export function createApp({create=createTransaction,find=findTransaction}={}) {
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const allowed=(process.env.CORS_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(origin && allowed.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Idempotency-Key');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');}
  if(req.method==='OPTIONS') return json(res,origin&&allowed.includes(origin)?204:403,{});
  try {
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/health'&&req.method==='GET') return json(res,200,{status:'ok'});
   if(url.pathname==='/api/v1/transactions'&&req.method==='POST') {
    if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) return json(res,415,{error:'Content-Type must be application/json'});
    const key=validateIdempotencyKey(req.headers['idempotency-key']);
    const order=validateOrder(await readJson(req));
    const result=await create(order,key);
    if(result.conflict) return json(res,409,{error:'Idempotency key was already used for another request'});
    return json(res,201,result.transaction);
   }
   const match=url.pathname.match(/^\/api\/v1\/transactions\/([0-9a-fA-F-]{36})$/);
   if(match&&req.method==='GET'){
    const tx=await find(match[1]);
    return tx?json(res,200,tx):json(res,404,{error:'Transaction not found'});
   }
   return json(res,404,{error:'Not found'});
  } catch(e) {
   if(e.status===413) return json(res,413,{error:e.message});
   if(e instanceof SyntaxError || /^Invalid |^Amount must/.test(e.message)) return json(res,400,{error:e.message});
   console.error('API request failed',e);
   return json(res,500,{error:'Internal server error'});
  }
 });
}
