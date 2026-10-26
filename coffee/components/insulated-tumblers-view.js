import { ResponsiveProductImage as Image } from "@/coffee/components/responsive-product-image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, Palette, Snowflake, ThermometerSun } from "lucide-react";
import { CollectionProducts } from "@/coffee/components/collection-products";
import { RfqForm } from "@/coffee/components/rfq-form";
import { RecentWorkBar, RecentWorkPreview } from "@/components/RecentWork";
export function InsulatedTumblersView({ products, customization }) {
    const featured = products[0];
    return (<main className="bg-[#f6f7f5] text-slate-950">
      <section className="relative overflow-hidden bg-emerald-950 text-white sm:min-h-[320px]">
        <Image src={featured ? featured.imageUrl : "/brand/flaskwholesale-hero.jpg"} alt="Custom stainless steel insulated tumbler" priority desktopOnly sizes="100vw" className="hidden object-contain object-right sm:block"/>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/10"/>
        <div className="relative mx-auto flex max-w-7xl items-center px-4 py-6 sm:min-h-[320px] sm:px-6 sm:py-10 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200 sm:text-sm">Custom stainless steel drinkware</p>
            <h1 className="mt-2 font-serif text-3xl leading-tight sm:mt-4 sm:text-5xl">Coffee Mug</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-lg sm:leading-8">
              Vacuum-insulated mugs for cafes, lifestyle brands, corporate gifting, and retail programs. Customise the colour, logo, finish, and packaging for your project.
            </p>
            <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
              {featured ? (<Link href={`/coffee-mug/${featured.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-slate-950">
                  Explore a tumbler <ArrowRight size={18}/>
                </Link>) : null}
              <a href="#quote" className="rounded-full border border-white/70 px-5 py-3 font-bold text-white hover:bg-white/10">
                Request a quote
              </a>
            </div>
          </div>
        </div>
      </section>

      <RecentWorkBar />

      <section className="hidden border-b border-slate-200 bg-white sm:block">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Feature icon={ThermometerSun} title="Vacuum insulated" body="Double-wall construction for hot and cold drinks."/>
          <Feature icon={Palette} title="Custom branding" body="Logo, colour, surface finish, and packaging options."/>
          <Feature icon={BadgeCheck} title="Flexible quantities" body="Check each product for its minimum order."/>
          <Feature icon={Box} title="Worldwide delivery" body="Carton and freight options confirmed for your destination."/>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">{products.length} styles · Custom branding</p>
            <h2 className="mt-2 text-xl font-extrabold sm:text-3xl">Shop insulated tumblers</h2>
          </div>
          <p className="hidden max-w-xl text-slate-600 sm:block">Compare capacities and colours, choose your options, and build one inquiry for your full collection.</p>
        </div>
        {products.length ? (<CollectionProducts products={products}/>) : (<div className="rounded-md border border-slate-200 bg-white p-8 text-slate-600">The first insulated tumbler is being prepared.</div>)}
      </section>

      <RecentWorkPreview />

      <section id="customization" className="scroll-mt-28 border-t border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{customization.heading}</h2>
          <p className="mt-3 max-w-5xl text-base leading-7 text-slate-600 sm:text-lg">{customization.intro}</p>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {customization.options.map((option) => <CustomizationCard key={option.title} option={option}/>)}
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Snowflake className="text-emerald-300" size={34}/>
            <h2 className="mt-4 text-3xl font-extrabold">Built for custom brand programs</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/75">Choose laser engraving, silk screen, heat transfer, or UV printing. We can also match custom colours and prepare retail-ready or gift packaging.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail title="Logo methods" body="Laser, silk screen, heat transfer, and UV printing"/>
            <Detail title="Surface finishes" body="Spray paint, powder coat, matte, or brushed steel"/>
            <Detail title="Colour options" body="Standard colours plus custom shades"/>
            <Detail title="Packaging" body="White box, custom colour box, or gift box"/>
          </div>
        </div>
      </section>

      <section id="quote" className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RfqForm products={products} defaultProduct={featured}/>
        </div>
      </section>
    </main>);
}
function Feature({ icon: Icon, title, body }) {
    return <div className="flex gap-3"><Icon className="mt-1 shrink-0 text-emerald-700" size={24}/><div><h2 className="font-extrabold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></div>;
}
function Detail({ title, body }) {
    return <div className="border-l-2 border-emerald-400 pl-4"><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-white/70">{body}</p></div>;
}
function CustomizationCard({ option }) {
    return (<Link href={`/coffee-mug/customization/${option.slug}`} className="group overflow-hidden rounded-md border border-slate-200 bg-[#f7f7f8] transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
      <div className="relative aspect-[47/32] overflow-hidden bg-slate-100">
        {option.imageUrl ? (<Image src={option.imageUrl} alt={option.alt} sizes="(min-width: 768px) 33vw, 100vw" className="object-cover"/>) : null}
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="flex items-center justify-between gap-3 text-xl font-extrabold">
          {option.title}
          <ArrowRight className="shrink-0 text-emerald-700 transition group-hover:translate-x-1" size={20}/>
        </h3>
        <p className="mt-3 leading-7 text-slate-600">{option.description}</p>
      </div>
    </Link>);
}
