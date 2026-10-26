import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createClient} from '@sanity/client';
import {productCode} from '../coffee/lib/catalog.js';
const prices={'CM-01':[2.66,3.87],'CM-02':[3.51],'CM-03':[3.26],'CM-04':[3.14,3.39,3.51],'CM-05':[3.02,3.26],'CM-06':[2.54],'CM-07':[3.05],'CM-08':[2.66,2.90],'CM-09':[4.35,7.25],'CM-11':[3.94],'CM-12':[3.26],'CM-13':[2.42,2.90],'CM-14':[3.87]};
const apply=process.argv.includes('--apply');
const token=apply?JSON.parse(fs.readFileSync('/Users/xiaziwen/.config/sanity/config.json','utf8')).authToken:undefined;
const client=createClient({projectId:'12npkiv4',dataset:'production',apiVersion:'2026-10-26',useCdn:false,token,maxRetries:0});
const products=await client.fetch('*[_type=="coffeeProduct"]');
const label=p=>{const min=Math.min(...p),max=Math.max(...p);return `US$${min.toFixed(2)}${min===max?'':'-'+max.toFixed(2)} / pc EXW`;};
function capacity(value,key=''){
 if(key.startsWith('_')||key==='slug'||/url|sourceProject/i.test(key))return value;
 if(typeof value==='string')return value.replace(/27\s*oz\s*\/\s*(?:approximately\s*)?800\s*ml/gi,'30oz').replace(/27\s*oz/gi,'30oz').replace(/\s*\/\s*(?:approximately\s*)?800\s*ml/gi,'').replace(/800\s*ml/gi,'30oz');
 if(Array.isArray(value))return value.map(v=>capacity(v));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,capacity(v,k)]));
 return value;
}
let tx=client.transaction();
for(const p of products){
 const code=productCode(p.slug),plan=prices[code];if(!plan)continue;
 assert.equal(p.variants.length,plan.length,code+' variants changed');
 const variants=p.variants.map((v,i)=>({...v,priceUsd:plan[i],name:v.name.replace(/((?:US)?\$)\s*\d+(?:\.\d+)?/gi,(_,currency)=>currency+plan[i].toFixed(2))}));
 const set={variants,fromPriceLabel:label(plan)};
 if(code==='CM-11')for(const [key,value]of Object.entries({...p,variants})){const revised=capacity(value,key);if(JSON.stringify(value)!==JSON.stringify(revised))set[key]=revised;}
 if(code==='CM-13')set.videoUrls=[];
 console.log(code,JSON.stringify(set));
 tx=tx.patch(p._id,patch=>{let result=patch.ifRevisionId(p._rev).set(set);return code==='CM-13'?result.unset(['videoFile','videoPoster','videoPosterUrl']):result;});
}
assert.equal(Object.keys(prices).length,products.filter(p=>prices[productCode(p.slug)]).length);
assert.equal(products.find(p=>productCode(p.slug)==='CM-10').isActive,false);
if(apply){
 const backup=path.resolve('../backups/coffee-before-20261026-'+Date.now()+'.json');fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,JSON.stringify(products,null,2));console.log('Backup:',backup);
 await tx.commit();console.log('Applied to Flask Sanity only.');
 const actual=await client.fetch('*[_type=="coffeeProduct"]');
 for(const p of actual){const code=productCode(p.slug);if(!prices[code])continue;const before=products.find(x=>x._id===p._id);assert.deepEqual(p.variants.map(v=>v.priceUsd),prices[code]);assert.equal(p.fromPriceLabel,label(prices[code]));assert.equal(p.slug,before.slug);assert.equal(p.moq,before.moq);assert.deepEqual(p.variants.map(v=>v.moq),before.variants.map(v=>v.moq));assert.equal(p.imageUrl,before.imageUrl);assert.deepEqual(p.galleryImages.map(v=>v.imageUrl),before.galleryImages.map(v=>v.imageUrl));
  if(code==='CM-11'){assert.ok(p.name.startsWith('30oz'));assert.equal(p.variants[0].size,'30oz');for(const k of ['name','description','detailText','shortDescription','specificationsText','features','tags','variants'])assert.ok(!/27\s*oz|800\s*ml/i.test(JSON.stringify(p[k])));}
  if(code==='CM-13'){assert.deepEqual(p.videoUrls,[]);for(const k of ['videoFile','videoPoster','videoPosterUrl'])assert.equal(p[k],undefined);}
 }
 assert.equal(actual.find(p=>productCode(p.slug)==='CM-10').isActive,false);console.log('PASS: all prices, CM11 capacity, CM13 video removal, media/MOQ/slug preservation, CM10 inactive.');
}
