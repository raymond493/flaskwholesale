"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

const menus = [
  {
    label: "Products",
    href: "/products",
    columns: [
      { title: "Product Categories", links: [["Water Bottles", "/product-category/water-bottles"], ["Tumblers and Mugs", "/product-category/tumblers-mugs"], ["Shaker Bottles", "/product-category/shaker-bottles"], ["Water Jugs", "/product-category/water-jugs"], ["Can Coolers", "/product-category/can-coolers"]] },
      { title: "Feature Categories", links: [["Dual-Function Lid Bottles", "/product-tag/freesip-insulated-bottles"], ["Rhinestone Bottles", "/product-tag/rhinestone-water-bottle"], ["Soccer Bottles", "/product-tag/world-cup-custom-insulated-bottles"], ["Smart Bottles", "/product-tag/insulated-smart-water-bottle"], ["Bamboo Lid Bottles", "/product-tag/wooden-bamboo-lid-insulated-bottles"], ["Spout Lid Bottles", "/product-tag/spout-lid-water-bottle"], ["Coffee Shop Tumblers", "/product-tag/coffee-tumblers-for-coffee-shops"], ["Christmas Cups", "/product-tag/christmas-insulated-cups"]] },
    ],
  },
  {
    label: "Custom Solutions",
    href: "/stainless-steel-drinkware-custom-solutions",
    columns: [
      { title: "Branding", links: [["Private Label", "/stainless-steel-drinkware-custom-solutions/private-label-water-bottles"], ["Custom Logo", "/stainless-steel-drinkware-custom-solutions/custom-logo"], ["UV Printing", "/stainless-steel-drinkware-custom-solutions/custom-logo/uv-printing-bottle-logo"], ["Silkscreen Printing", "/stainless-steel-drinkware-custom-solutions/custom-logo/silkscreen-logo-printing"], ["Laser Engraving", "/stainless-steel-drinkware-custom-solutions/custom-logo/laser-logo-engraving"]] },
      { title: "Product Development", links: [["Surface Finishing", "/stainless-steel-drinkware-custom-solutions/surface-finishing-options"], ["Spray Painting", "/stainless-steel-drinkware-custom-solutions/surface-finishing-options/spray-painting"], ["Powder Coating", "/stainless-steel-drinkware-custom-solutions/surface-finishing-options/powder-coating"], ["Rhinestone Decoration", "/stainless-steel-drinkware-custom-solutions/surface-finishing-options/rhinestone-decoration"], ["Custom Mould", "/stainless-steel-drinkware-custom-solutions/custom-drinkware-mold"], ["Custom Colour", "/stainless-steel-drinkware-custom-solutions/custom-color"], ["Packaging Solutions", "/stainless-steel-drinkware-custom-solutions/packaging-solusions"]] },
    ],
  },
  {
    label: "About Us",
    href: "/about-us",
    columns: [
      { title: "Company", links: [["About Us", "/about-us"], ["Payment Terms", "/payment-terms"], ["Shipping & Delivery", "/shipping-and-delivery"], ["Cases", "/case"]] },
      { title: "Manufacturing Process", links: [["Process Overview", "/insulated-bottle-manufacturing-process"], ["Material Preparation", "/insulated-bottle-manufacturing-process/material-preparation"], ["Bottle Body Forming", "/insulated-bottle-manufacturing-process/bottle-body-forming"], ["Welding Process", "/insulated-bottle-manufacturing-process/welding-process"], ["Vacuum Extraction", "/insulated-bottle-manufacturing-process/vacuum-extraction"], ["Electrolytic Cleaning", "/insulated-bottle-manufacturing-process/electrolytic-cleaning"], ["Polishing & Colouring", "/insulated-bottle-manufacturing-process/polishing-and-coloring"], ["Lid Injection Moulding", "/insulated-bottle-manufacturing-process/lid-injection-molding"]] },
    ],
  },
  {
    label: "Knowledge Center",
    href: "/knowledge-center",
    columns: [{ title: "Buyer Resources", links: [["Knowledge Center", "/knowledge-center"], ["Manufacturing Methods", "/manufacturing-methods"], ["Quality Control & Testing", "/quality-control-testing"], ["Buyer Reference & Technical Knowledge", "/buyer-reference-technical-knowledge"], ["FAQ & Help Center", "/faq"]] }],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="topbar"><div className="container"><span>OEM & ODM stainless steel drinkware manufacturer</span><div className="topbar-links"><a href={site.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a></div></div></div>
    <header className="header"><div className="container nav">
      <Link className="brand" href="/"><span className="brand-mark">F</span><span>FlaskWholesale</span></Link>
      <button className="menu-button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <nav className={`menu ${open ? "is-open" : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/coffee-mug" onClick={() => setOpen(false)}>Coffee Mug</Link>
        {menus.map((menu) => <div className={`nav-group ${menu.columns.length > 1 ? "wide" : ""}`} key={menu.label}>
          <Link href={menu.href} onClick={() => setOpen(false)}>{menu.label}<span className="nav-chevron">⌄</span></Link>
          <div className="dropdown">{menu.columns.map((column) => <div key={column.title}><strong>{column.title}</strong>{column.links.map(([label, href]) => <Link href={href} onClick={() => setOpen(false)} key={href}>{label}</Link>)}</div>)}</div>
        </div>)}
        <Link href="/contact-us" onClick={() => setOpen(false)}>Contact Us</Link>
      </nav>
      <Link className="button" href="/contact-us">Get a Quote</Link>
    </div></header>
  </>;
}
