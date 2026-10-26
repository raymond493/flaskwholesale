import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createClient} from '@sanity/client';
import {productCode} from '../coffee/lib/catalog.js';
const expected={'CM-01':[2.66,3.87],'CM-02':[3.51],'CM-03':[3.26],'CM-04':[3.14,3.39,3.51],'CM-05':[3.02,3.26],'CM-06':[2.54],'CM-07':[3.05],'CM-08':[2.66,2.9],'CM-09':[4.35,7.25],'CM-11':[3.94],'CM-12':[3.26],'CM-13':[2.42,2.9],'CM-14':[3.87]};
const client=createClient({projectId:'12npkiv4',dataset:'production',apiVersion:'2026-10-26',useCdn:false});
const products=await client.fetch('*[_type=="coffeeProduct"]');
const origin=process.argv[2];
for(const p of products){
 const code=productCode(p.slug);if(!expected[code])continue;
 assert.deepEqual(p.variants.map(v=>v.priceUsd),expected[code],code);
 const page='/coffee-mug/'+p.slug;
 const html=origin?await fetch(origin+page,{signal:AbortSignal.timeout(30000)}).then(async r=>{assert.equal(r.status,200,page);return r.text();}):fs.readFileSync('.next/server/app'+page+'.html','utf8');
 let decoded=html;for(let i=0;i<3;i++)decoded=decoded.replace(/\\"/g,'"');
 for(const v of p.variants){assert.ok(decoded.includes('"priceUsd":'+v.priceUsd),code+' missing rendered variant price '+v.priceUsd);assert.ok(decoded.includes('"size":"'+v.size+'"'),code+' missing rendered variant size '+v.size);}
 assert.ok(decoded.includes(p.fromPriceLabel),code+' label');
 if(code==='CM-11'){const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ');assert.ok(visible.includes('30oz Vacuum Insulated Travel Tumbler'));assert.ok(!/27\s*oz|800\s*ml/i.test(visible));assert.equal(p.variants[0].size,'30oz');}
 if(code==='CM-13'){assert.deepEqual(p.videoUrls,[]);assert.ok(!html.includes('View product video'));assert.ok(!html.includes('9ca6100a6b8df5ddc65e5440bd8594c2e0e1395c.mp4'));assert.ok(p.galleryImages.length>0);}
 console.log('PASS',code,p.variants.map(v=>v.size+' = US$'+v.priceUsd.toFixed(2)).join('; '));
}
assert.equal(products.find(p=>productCode(p.slug)==='CM-10').isActive,false);
if(origin){const status=await fetch(origin+'/api/rfq').then(r=>r.json());assert.equal(status.configured,true);console.log('PASS RFQ configured');}
console.log('PASS all 13 products; CM11 30oz; CM13 no video; CM10 inactive.');
