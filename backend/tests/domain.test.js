import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOrder,validateIdempotencyKey,hashOrder} from '../src/domain.js';
const valid={service:'airtime',customerReference:'08012345678',amount:'100.50'};
test('converts NGN to integer kobo',()=>assert.equal(validateOrder(valid).amountKobo,10050));
test('rejects floating point amounts and out of range values',()=>{for(const amount of [100.5,'1e3','0','100.999','1000001']) assert.throws(()=>validateOrder({...valid,amount}));});
test('rejects invalid services',()=>assert.throws(()=>validateOrder({...valid,service:'wallet'})));
test('validates idempotency keys',()=>{assert.equal(validateIdempotencyKey('valid_key_1234567'),'valid_key_1234567');assert.throws(()=>validateIdempotencyKey('short'));});
test('hash is stable',()=>assert.equal(hashOrder(validateOrder(valid)),hashOrder(validateOrder(valid))));
