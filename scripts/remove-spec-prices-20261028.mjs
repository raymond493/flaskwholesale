import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createClient} from '@sanity/client';
import {isPriceSpecification,removePriceSpecifications,parseSpecItems} from '../coffee/lib/specifications.js';
for(const label of ['Price','Unit price','Pricing','EXW Price','Wholesale price','Product price (USD)','Price: US$2.90'])assert.ok(isPriceSpecification(label),label);
for(const label of ['Material','MOQ','Price label colour','Customisation','Product weight'])assert.ok(!isPriceSpecification(label),label);
const sample='Capacity\n12oz\n\nUnit price\nUS$2.90\n\nMOQ\n50\n\nPricing\nOld quote\n\nCustomisation\nLogo pricing confirmed separately';
assert.deepEqual(parseSpecItems(sample).map(i=>i.label),['Capacity','MOQ','Customisation']);
assert.equal(removePriceSpecifications(removePriceSpecifications(sample)),removePriceSpecifications(sample));
const token=JSON.parse(fs.readFileSync('/Users/xiaziwen/.config/sanity/config.json','utf8')).authToken;
const client=createClient({projectId:'12npkiv4',dataset:'production',apiVersion:'2026-10-26',useCdn:false,token,maxRetries:0});
const before=await client.fetch('*[defined(specificationsText)]');
fs.mkdirSync('../backups',{recursive:true});const backup='../backups/before-remove-spec-prices-'+Date.now()+'.json';fs.writeFileSync(backup,JSON.stringify(before,null,2));
let transaction=client.transaction(),count=0;
for(const p of before){const cleaned=removePriceSpecifications(p.specificationsText);if(cleaned!==p.specificationsText){transaction=transaction.patch(p._id,patch=>patch.ifRevisionId(p._rev).set({specificationsText:cleaned}));count++;}}
if(count)await transaction.commit();
const after=await client.fetch('*[defined(specificationsText)]');
for(const p of before){const actual=after.find(a=>a._id===p._id);assert.equal(actual.specificationsText,removePriceSpecifications(p.specificationsText));for(const key of Object.keys(p).filter(k=>!['_rev','_updatedAt','specificationsText'].includes(k)))assert.deepEqual(actual[key],p[key],p._id+' '+key);assert.ok(parseSpecItems(actual.specificationsText).every(i=>!isPriceSpecification(i.label)));}
console.log(`PASS: scanned ${before.length} documents; cleaned ${count}; other specifications, prices, media, sorting and all other fields preserved. Backup: ${backup}`);
