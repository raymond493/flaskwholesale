"use client";
import { useMemo, useState } from "react";
import { parseSpecItems } from "@/coffee/lib/specifications";
const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "faq", label: "FAQ" },
    { id: "description", label: "Description" }
];
export function ProductDetailTabs({ specificationsText, faqText, detailText }) {
    const [activeTab, setActiveTab] = useState("specifications");
    const specItems = useMemo(() => parseSpecItems(specificationsText), [specificationsText]);
    const faqItems = useMemo(() => parseFaqItems(faqText), [faqText]);
    const descriptionParagraphs = useMemo(() => parseParagraphs(detailText), [detailText]);
    return (<section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-4">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-full border px-7 py-3 text-lg font-bold transition md:px-10 md:text-xl ${isActive ? "border-slate-950 bg-white text-slate-950" : "border-transparent bg-[#f4f5f6] text-slate-700 hover:bg-white"}`}>
              {tab.label}
            </button>);
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 md:p-10">
        {activeTab === "specifications" ? (specItems.length ? (<div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
              {specItems.map((item) => (<div key={`${item.label}-${item.value}`} className="space-y-2">
                  <p className="text-xl font-extrabold text-slate-950">• {item.label}</p>
                  <div className="whitespace-pre-line pl-6 text-lg leading-8 text-slate-600">{item.value}</div>
                </div>))}
            </div>) : (<EmptyPanel label="Specifications"/>)) : null}

        {activeTab === "faq" ? (faqItems.length ? (<div className="space-y-6">
              {faqItems.map((item) => (<div key={item.question} className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-950">{item.question}</h3>
                  <p className="text-lg leading-8 text-slate-600">{item.answer}</p>
                </div>))}
            </div>) : (<EmptyPanel label="FAQ"/>)) : null}

        {activeTab === "description" ? (descriptionParagraphs.length ? (<div className="space-y-5">
              {descriptionParagraphs.map((paragraph, index) => index === 0 && descriptionParagraphs.length > 1 ? (<h3 key={paragraph} className="text-2xl font-extrabold text-slate-950">
                    {paragraph}
                  </h3>) : (<p key={paragraph} className="text-lg leading-8 text-slate-600">
                    {paragraph}
                  </p>))}
            </div>) : (<EmptyPanel label="Description"/>)) : null}
      </div>
    </section>);
}
function parseFaqItems(text = "") {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const items = [];
    for (let index = 0; index < lines.length; index += 2) {
        const question = lines[index];
        const answer = lines[index + 1];
        if (question && answer)
            items.push({ question, answer });
    }
    return items;
}
function parseParagraphs(text = "") {
    return text.split(/\n{1,}/).map((line) => line.trim()).filter(Boolean);
}
function EmptyPanel({ label }) {
    return <p className="text-lg text-slate-500">{label} content is being prepared for this product.</p>;
}
