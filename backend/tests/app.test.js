import test from 'node:test';import assert from 'node:assert/strict';import {createApp} from '../src/app.js';
test('health, create, replay and conflict routes',async()=>{
 const tx={id:'123e4567-e89b-42d3-a456-426614174000',service:'airtime',amountKobo:10000,currency:'NGN',status:'pending'};
 const seen=new Map();
 const server=createApp({create:async(order,key)=>{const old=seen.get(key);if(old&&old!==order.amountKobo)return {conflict:true};seen.set(key,order.amountKobo);return {transaction:tx};},find:async(id)=>id===tx.id?tx:null});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await fetch(url+'/health')).status,200);
  const headers={'content-type':'application/json','idempotency-key':'test_idempotency_12345'};
  const body=JSON.stringify({service:'airtime',customerReference:'08012345678',amount:'100'});
  assert.equal((await fetch(url+'/api/v1/transactions',{method:'POST',headers,body})).status,201);
  assert.equal((await fetch(url+'/api/v1/transactions',{method:'POST',headers,body})).status,201);
  assert.equal((await fetch(url+'/api/v1/transactions',{method:'POST',headers,body:JSON.stringify({service:'airtime',customerReference:'08012345678',amount:'200'})})).status,409);
  assert.equal((await fetch(url+'/api/v1/transactions/'+tx.id)).status,200);
  assert.equal((await fetch(url+'/api/v1/transactions/123e4567-e89b-42d3-a456-426614174999')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
