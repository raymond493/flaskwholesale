import assert from "node:assert/strict";
import {buildRfqMessage,resolveRfqProduct} from "../coffee/lib/rfq-message.js";

const catalog=[
  {slug:"12oz-slim-insulated-coffee-tumbler-with-slide-lid",name:"Slim tumbler"},
  {slug:"16oz-stainless-steel-tumbler-with-three-interchangeable-lids",name:"Three-lid tumbler"}
];
const contact={name:"Test buyer",email:"buyer@example.com",country:"Australia",quantity:"100"};
const single=buildRfqMessage({...contact,productSlug:catalog[0].slug,productName:"Old name"},catalog,{reference:"FW-TEST"});
assert.equal(single.subject,"FlaskWholesale RFQ — CM-13");
assert.equal(single.productSlug,catalog[0].slug);
assert.match(single.text,/Reference: FW-TEST\nModel \/ SKU: CM-13/);
assert.match(single.html,/Reference: FW-TEST<br>Model \/ SKU: CM-13/);
assert.equal(single.items[0].productName,"Slim tumbler");
assert.equal(resolveRfqProduct({productName:catalog[1].name},catalog).model,"CM-09");
assert.equal(resolveRfqProduct({productName:catalog[0].name},[...catalog,{...catalog[1],name:catalog[0].name}]).found,false);
assert.equal(resolveRfqProduct({productSlug:"invalid",productName:catalog[0].name},catalog).found,false);
const multi=buildRfqMessage({...contact,inquiryItems:[
  {productSlug:catalog[0].slug,quantity:100},
  {productSlug:catalog[0].slug,quantity:200},
  {productSlug:catalog[1].slug,quantity:300}
]},catalog,{reference:"FW-MULTI"});
assert.equal(multi.modelSummary,"CM-13, CM-09");
assert.equal(multi.subject,"FlaskWholesale RFQ — CM-13, CM-09");
assert.equal((multi.text.match(/Product: CM-13 /g)||[]).length,2);
assert.equal((multi.text.match(/Product: CM-09 /g)||[]).length,1);
const unknown=buildRfqMessage({...contact,productName:"Unlisted product",message:"<script>alert('test')</script>"},catalog);
assert.equal(unknown.modelSummary,"Not specified");
assert.doesNotMatch(unknown.subject,/Unknown|CM-/);
assert.doesNotMatch(unknown.html,/<script>/);
assert.match(unknown.html,/&lt;script&gt;/);
assert.match(unknown.html,/<div><br><\/div>/);
console.log("RFQ tests passed: stable model codes, exact legacy matching, deduplicated summary, per-line codes, HTML escaping; no messages sent.");
