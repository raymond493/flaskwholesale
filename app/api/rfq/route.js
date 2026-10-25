import {getProducts} from "@/coffee/lib/products";
import {createRfqHandler,mailConfigured} from "@/coffee/lib/rfq-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){return Response.json({configured:mailConfigured(process.env)},{headers:{"Cache-Control":"no-store"}});}
export const POST=createRfqHandler({env:process.env,loadCatalog:getProducts});
