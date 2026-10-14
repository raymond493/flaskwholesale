import assert from "node:assert/strict";
import { productVideo, productGalleryMedia } from "../coffee/lib/product-media.js";

const images=[{imageUrl:"https://cdn.sanity.io/images/example/production/main.jpg"},{imageUrl:"second.jpg"},{imageUrl:"third.jpg"}];
const native="https://cdn.sanity.io/files/example/production/test.mp4";
assert.equal(productVideo(native,images[0].imageUrl).provider,"sanity");
for(const url of ["https://youtube.com/shorts/hf77NaqWZg8?feature=share","https://www.youtube.com/shorts/taOKhD7yezM","https://youtu.be/hf77NaqWZg8"]) assert.equal(productVideo(url).provider,"youtube");
for(const url of [null,undefined,"javascript:alert(1)","http://cdn.sanity.io/files/p/d/a.mp4","https://cdn.sanity.io.evil.test/files/p/d/a.mp4","https://cdn.sanity.io/images/p/d/a.jpg"]) assert.equal(productVideo(url),null);
const media=productGalleryMedia(images,[native]);
assert.deepEqual(media.map(m=>m.type),["image","video","image","image"]);
assert.equal(media[1].url,native);
assert.equal(media[1].poster,images[0].imageUrl);
assert.equal(productGalleryMedia(images,[native],"dedicated-cover.jpg")[1].poster,"dedicated-cover.jpg");
assert.deepEqual(media.filter(m=>m.type==="image").map(m=>m.image),images);
assert.equal(productGalleryMedia(images,null).length,3);
console.log("PASS: Sanity CDN video, YouTube compatibility, poster, video second, image order, nullable inputs and rejected non-CDN URLs.");
