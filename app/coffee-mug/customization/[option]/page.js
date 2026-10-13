import Image from "@/components/SanityImage";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { optimizedImageUrl } from "@/coffee/lib/images";
import { getInsulatedTumblerCustomization } from "@/coffee/lib/products";
import { getTumblerCustomizationPage, tumblerCustomizationPages } from "@/coffee/lib/tumbler-customization-pages";
export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
    return tumblerCustomizationPages.map((page) => ({ option: page.slug }));
}
export async function generateMetadata({ params }) {
    const { option } = await params;
    const page = getTumblerCustomizationPage(option);
    return { title: page ? page.title : "Tumbler Customization", description: page?.description, alternates: {canonical: `/coffee-mug/customization/${option}`} };
}
export default async function TumblerCustomizationPage({ params }) {
    const { option } = await params;
    const page = getTumblerCustomizationPage(option);
    if (!page)
        notFound();
    const customization = await getInsulatedTumblerCustomization();
    const card = customization.options.find((item) => item.slug === option);
    return (<main className="bg-[#f6f7f5] text-slate-950">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <Link href="/coffee-mug#customization" className="mb-7 inline-flex w-fit items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600">
              <ArrowLeft size={17}/> Back to Insulated Tumblers
            </Link>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-emerald-700">{page.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {page.highlights.map((item) => <div key={item} className="flex items-center gap-2 font-bold"><Check className="text-emerald-700" size={19}/>{item}</div>)}
            </div>
            <Link href="/coffee-mug/quote" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 font-bold text-white hover:bg-emerald-700">
              {page.cta} <ArrowRight size={18}/>
            </Link>
          </div>
          <div className="relative aspect-[47/32] overflow-hidden rounded-md bg-slate-100">
            {card?.imageUrl ? <Image src={optimizedImageUrl(card.imageUrl, 1000, 84)} alt={card.alt} fill priority unoptimized className="object-cover"/> : null}
          </div>
        </div>
      </section>

      {card?.galleryImages?.length ? (<section className="border-t border-slate-200 bg-[#f6f7f5] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">Production examples</p>
            <h2 className="mt-2 text-3xl font-extrabold">See the available finishes</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {card.galleryImages.map((image, index) => (<figure key={`${image.imageUrl}-${index}`} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                  <div className="relative aspect-[3/2] bg-slate-100">
                    <Image src={optimizedImageUrl(image.imageUrl, 1000, 84)} alt={image.alt || `${page.title} example ${index + 1}`} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover"/>
                  </div>
                  <figcaption className="px-4 py-3 text-sm font-semibold text-slate-700">{image.alt || `${page.title} example ${index + 1}`}</figcaption>
                </figure>))}
            </div>
          </div>
        </section>) : null}

      {page.sections.map((section, sectionIndex) => (<section key={section.heading} className={sectionIndex % 2 ? "bg-white py-14" : "py-14"}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold">{section.heading}</h2>
            {section.intro ? <p className="mt-3 max-w-4xl leading-7 text-slate-600">{section.intro}</p> : null}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (<article key={item.title} className="rounded-md border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
                  {item.note ? <p className="mt-4 font-bold text-emerald-800">{item.note}</p> : null}
                </article>))}
            </div>
          </div>
        </section>))}

      {page.table ? (<section className="bg-white py-14">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead><tr>{page.table.headings.map((heading) => <th key={heading} className="border-b-2 border-emerald-800 p-4 text-sm uppercase tracking-wide">{heading}</th>)}</tr></thead>
              <tbody>{page.table.rows.map((row) => <tr key={row.join("-")} className="border-b border-slate-200">{row.map((cell) => <td key={cell} className="p-4 text-slate-600">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>) : null}

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white px-5">
            {page.faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-extrabold">{faq.question}</summary><p className="mt-3 leading-7 text-slate-600">{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div><h2 className="text-2xl font-extrabold">Start your custom tumbler project</h2><p className="mt-2 text-white/70">Send your preferred product, artwork, quantity, colors, and delivery destination.</p></div>
          <Link href="/coffee-mug/quote" className="rounded-full bg-white px-6 py-3 font-bold text-emerald-950">{page.cta}</Link>
        </div>
      </section>
    </main>);
}
