export { getCategoryCards, getCategoryProducts, getProduct, getProducts, getTagProducts } from "@/lib/sanity";

export const site = {
  name: "FlaskWholesale",
  origin: "https://flaskwholesale.com",
  phone: "+86 132 6710 2135",
  whatsapp: "https://wa.me/8613267102135",
  email: "raymond@flaskwholesale.com",
};

const originalLatestOrder = [
  "17oz-christmas-coffee-tumbler-with-dual-drinking-lid",
  "460ml-christmas-stainless-steel-tumbler-with-metal-straw",
  "600ml-20oz-christmas-insulated-tumbler-with-handle-and-tea-infuser",
  "12oz-christmas-egg-shaped-stainless-steel-tumbler",
  "40oz-christmas-stainless-steel-tumbler-with-handle",
  "350ml-12oz-stainless-steel-insulated-bottle-with-christmas-color-options",
  "single-wall-stainless-steel-protein-shaker-cup-with-scale-marks",
  "gradient-stainless-steel-shaker-cups-with-push-button-lids",
  "custom-carabiner-lid-stainless-steel-bottle-for-outdoor-and-worksite-use",
  "american-style-multi-size-stainless-steel-insulated-bottle-with-5-lid-options",
  "20oz-stainless-steel-flip-straw-vacuum-bottle-with-handle-lid",
  "yerba-mate-insulated-bottle-with-bombilla-straw",
];

export function sortProductsForDisplay(products) {
  const priority = new Map(originalLatestOrder.map((slug, index) => [slug, index]));
  return [...products].sort((a, b) => (priority.get(a.slug) ?? 10_000) - (priority.get(b.slug) ?? 10_000));
}

export const categories = {
  "water-bottles": {
    name: "Water Bottles",
    title: "Wholesale Insulated Stainless Steel Water Bottles",
    copy: "Food-grade insulated bottles for retail, outdoor, corporate gifting and promotional programs, with custom logos, colours, lids and packaging.",
  },
  "tumblers-mugs": {
    name: "Tumblers & Mugs",
    title: "Wholesale Stainless Steel Tumblers & Mugs",
    copy: "Coffee tumblers, travel mugs, handled cups and statement drinkware built for cafés, brands, gifting and retail.",
  },
  "shaker-bottles": {
    name: "Shaker Bottles",
    title: "Wholesale Stainless Steel Shaker Bottles",
    copy: "Durable protein shakers for gyms, supplement brands, fitness events and private-label programmes.",
  },
  "water-jugs": {
    name: "Water Jugs",
    title: "Wholesale Stainless Steel Water Jugs",
    copy: "Large-capacity insulated jugs for sports, outdoor, worksite and high-volume hydration projects.",
  },
  "can-coolers": {
    name: "Can Coolers",
    title: "Custom Stainless Steel Can Coolers",
    copy: "Metal koozies and insulated can coolers for beverage brands, events, gifts and outdoor retail.",
  },
};

export const featureCategories = {
  "freesip-insulated-bottles": {
    name: "Dual-Function Lid Bottles",
    title: "Wholesale Dual-Function Lid Insulated Bottles",
    copy: "Insulated bottles with versatile straw and direct-drink lid systems for sports, travel and retail collections.",
    queryTag: "dual-sip-lid-insulated-bottles",
  },
  "dual-sip-lid-insulated-bottles": {
    name: "Dual-Sip Lid Bottles",
    title: "Wholesale Dual-Sip Lid Insulated Bottles",
    copy: "Insulated bottles with versatile straw and direct-drink lid systems for sports, travel and retail collections.",
  },
  "world-cup-custom-insulated-bottles": {
    name: "Soccer Insulated Water Bottles",
    title: "Wholesale Soccer Insulated Water Bottles",
    copy: "Football-inspired insulated drinkware for clubs, teams, schools, fan merchandise and promotional projects.",
    queryTag: "soccer-insulated-water-bottles",
  },
  "rhinestone-water-bottle": {
    name: "Rhinestone Water Bottles",
    title: "Wholesale Rhinestone Water Bottles",
    copy: "High-impact rhinestone bottles and tumblers for gifts, fashion retail, events and custom branded programmes.",
  },
  "soccer-insulated-water-bottles": {
    name: "Soccer Water Bottles",
    title: "Wholesale Soccer Insulated Water Bottles",
    copy: "Football-inspired insulated drinkware for clubs, teams, schools, fan merchandise and promotional projects.",
  },
  "insulated-smart-water-bottle": {
    name: "Smart Water Bottles",
    title: "Wholesale Insulated Smart Water Bottles",
    copy: "Temperature-display and smart-feature bottles for gifting, retail and technology-focused promotions.",
  },
  "wooden-bamboo-lid-insulated-bottles": {
    name: "Bamboo Lid Bottles",
    title: "Wholesale Bamboo Lid Insulated Bottles",
    copy: "Clean, natural-looking insulated bottles with wooden or bamboo lid details for modern private-label ranges.",
  },
  "spout-lid-water-bottle": {
    name: "Spout Lid Bottles",
    title: "Wholesale Spout Lid Water Bottles",
    copy: "Practical spout-lid bottles for outdoor, sports, school and everyday hydration programmes.",
  },
  "coffee-tumblers-for-coffee-shops": {
    name: "Coffee Shop Tumblers",
    title: "Wholesale Coffee Tumblers for Coffee Shops",
    copy: "Reusable stainless steel tumblers selected for café merchandise, loyalty programmes and branded retail.",
  },
  "christmas-insulated-cups": {
    name: "Christmas Insulated Cups",
    title: "Wholesale Christmas Insulated Cups",
    copy: "Seasonal insulated cups and tumblers for holiday gifting, retail collections and promotional campaigns.",
  },
};

export const solutions = {
  "custom-logo": ["Custom Logo", "Laser engraving, screen printing and UV printing matched to your artwork and order size."],
  "uv-printing": ["UV Printing Bottle Logo", "Full-colour and raised UV printing for detailed artwork, gradients and wrap-around bottle branding."],
  "silkscreen-printing": ["Silkscreen Logo Printing", "Cost-effective, durable single-colour and spot-colour printing for bulk drinkware projects."],
  "laser-engraving": ["Laser Logo Engraving", "Permanent metal engraving for corporate gifts, premium bottles and understated brand marks."],
  "custom-color": ["Custom Colour", "Use available stock colours for speed or develop Pantone-matched colours for your collection."],
  "private-label": ["Private Label", "Coordinate product selection, logo, packaging, labels and delivery with one manufacturing partner."],
  "packaging-solutions": ["Packaging Solutions", "White boxes, kraft boxes, gift boxes, labels, barcodes and retail-ready sets."],
  "surface-finishing": ["Surface Finishing", "Powder coating, spray paint, matte, gloss, gradient and decorative finishes."],
  "spray-painting": ["Spray Painting", "Solid, gloss, gradient, electroplated and specialist spray finishes for stainless steel drinkware."],
  "powder-coating": ["Powder Coating", "Matte, glossy, textured and metallic powder-coated finishes with durable surface performance."],
  "rhinestone-decoration": ["Rhinestone Decoration", "Custom rhinestone colours, gradients and patterns for high-impact bottles and tumblers."],
  "custom-mold": ["Custom Mould", "Develop exclusive bottle shapes, lid structures and functional components for larger OEM projects."],
};

export const articles = {
  "why-moq-exists": ["Why MOQ Exists in Custom Stainless Steel Bottle Manufacturing", "Understand how materials, colours, printing, packaging and moulds affect the practical minimum order quantity."],
  "reduce-custom-bottle-costs": ["How to Reduce Custom Bottle Costs Without Reducing Quality", "Choose stock structures, focused decoration and right-sized packaging to build a stronger first order."],
  "coating-durability": ["How to Improve Coating Durability", "A buyer-friendly guide to surface preparation, coating selection, curing and adhesion testing."],
  "test-304-stainless-steel": ["How to Test 304 Stainless Steel", "Learn how material certificates, incoming checks and sample testing support consistent food-contact materials."],
  "bottle-performance-tests": ["Performance Tests for Insulated Bottles", "See how leak, insulation, impact and coating tests help reduce quality risk before shipment."],
  "private-label-styles": ["Popular Drinkware Styles for Private Label Brands", "Compare practical bottle, tumbler, shaker, jug and can-cooler formats for different channels."],
  "logo-methods": ["Laser, Screen or UV Printing: Which Logo Method?", "Match logo complexity, colour count, durability and order quantity with the right decoration process."],
  "shipping-custom-drinkware": ["Planning Global Delivery for Custom Drinkware", "A straightforward overview of express, air and sea shipping for samples and bulk orders."],
};

export const businessPages = {
  "about-us": {
    title: "About FlaskWholesale",
    description: "A stainless steel drinkware manufacturing partner for brands, wholesalers, cafés, promotional suppliers and e-commerce teams.",
    heading: "Factory capability built around reliable OEM projects",
    paragraphs: [
      "FlaskWholesale supplies stainless steel bottles, tumblers, mugs, shakers, water jugs and can coolers for global buyers. Our role is to make the sourcing path clear—from selecting a proven stock style to confirming branding, packaging, production and delivery.",
      "We support low-MOQ logo projects, private-label launches and larger OEM/ODM programmes with practical communication and staged approvals.",
    ],
    bullets: ["Broad product range with 100 migrated styles", "Logo customization from 50 pieces on selected models", "Food-grade materials and buyer-requested quality checks", "Sampling, production updates and inspection support", "Global express, air and sea delivery coordination"],
  },
  cases: {
    title: "Custom Drinkware Cases",
    description: "Examples of how cafés, brands, fitness companies, schools and promotional buyers structure custom drinkware orders.",
    heading: "Projects built for real buying scenarios",
    paragraphs: ["Typical projects include café merchandise tumblers, fitness-brand shaker bottles, school bottles, corporate gifts, event drinkware and retail-ready private-label collections."],
    bullets: ["Café merchandise with custom tumblers and branded boxes", "Fitness shakers with scale marks and private-label packaging", "Corporate gifts with presentation packaging", "Retail collections with coordinated colours, labels and cartons"],
  },
  "payment-terms": {
    title: "Payment Terms",
    description: "Clear payment milestones for samples, custom projects and bulk production.",
    heading: "Clear commercial terms before production",
    paragraphs: ["Payment terms are confirmed on the formal quotation and may vary according to order size, customization, product development and buyer history."],
    bullets: ["Samples and one-off setup costs are normally paid before sample production", "Bulk orders typically require a deposit before production", "The remaining balance is completed before shipment unless agreed otherwise", "Bank details appear only on the official proforma invoice"],
  },
  "shipping-and-delivery": {
    title: "Shipping & Delivery",
    description: "Compare express, air and sea delivery for custom stainless steel drinkware orders.",
    heading: "Choose the right delivery method",
    paragraphs: ["Samples and small orders can move by courier. Time-sensitive commercial orders may use air freight, while larger volume orders generally achieve better landed cost by sea."],
    bullets: ["Express courier for samples and compact urgent orders", "Air freight for time-sensitive commercial shipments", "Sea freight for larger quantities", "DDP, DAP, FOB and other terms available by quotation"],
  },
  "manufacturing-process": {
    title: "Manufacturing Process",
    description: "A transparent overview of stainless steel bottle manufacturing from material preparation to packing.",
    heading: "How insulated drinkware is made",
    paragraphs: ["Production moves through material preparation, body forming, welding, vacuum extraction, polishing, coating, decoration, assembly, testing and packing."],
    bullets: ["Material preparation and stainless steel tube cutting", "Inner and outer wall forming", "Welding and neck finishing", "Vacuum extraction and insulation testing", "Colour coating and logo decoration", "Lid assembly, leak testing and final inspection"],
  },
  "material-preparation": { title: "Material Preparation", description: "Stainless steel selection, inspection and tube preparation before forming.", heading: "Preparing materials for consistent bottle production", paragraphs: ["Production begins with the correct stainless steel grade, thickness and tube dimensions for the selected drinkware structure."], bullets: ["Incoming material inspection", "Tube cutting and preparation", "Traceable production batches"] },
  "bottle-body-forming": { title: "Bottle Body Forming", description: "How stainless steel tubes become inner and outer bottle bodies.", heading: "Forming the inner and outer walls", paragraphs: ["Controlled forming operations shape the bottle body, shoulder, neck and base before joining and finishing."], bullets: ["Tube expansion and drawing", "Shoulder and neck forming", "Dimensional inspection"] },
  "welding-process": { title: "Welding Process", description: "Precision welding for insulated stainless steel drinkware.", heading: "Joining components with controlled welds", paragraphs: ["Welding quality affects structure, appearance and the long-term vacuum performance of insulated products."], bullets: ["Seam and base welding", "Weld inspection", "Surface preparation for later finishing"] },
  "vacuum-extraction": { title: "Vacuum Extraction", description: "Creating the vacuum layer that supports thermal insulation.", heading: "Building reliable insulation performance", paragraphs: ["Air is extracted between the inner and outer walls before the vacuum port is sealed and tested."], bullets: ["Vacuum extraction", "Port sealing", "Thermal performance testing"] },
  "electrolytic-cleaning": { title: "Electrolytic Cleaning", description: "Cleaning stainless steel surfaces after forming and welding.", heading: "Preparing clean food-contact surfaces", paragraphs: ["Electrolytic cleaning removes manufacturing residue and supports a consistent stainless steel finish."], bullets: ["Interior cleaning", "Residue removal", "Surface inspection"] },
  "polishing-and-coloring": { title: "Polishing and Colouring", description: "Surface finishing before logo decoration and assembly.", heading: "Creating the final product appearance", paragraphs: ["Bodies are polished and prepared for powder coating, spray painting, electroplating or other decorative finishes."], bullets: ["Brushing and polishing", "Coating preparation", "Colour and appearance inspection"] },
  "lid-injection-molding": { title: "Lid Injection Moulding", description: "Plastic component moulding and lid assembly for drinkware.", heading: "Producing functional lids and components", paragraphs: ["Lids, handles, seals and drinking components are moulded, assembled and tested for fit and function."], bullets: ["Food-contact plastic options", "Component and seal assembly", "Leak and function testing"] },
  "manufacturing-methods": { title: "Manufacturing Methods", description: "Technical guides to stainless steel drinkware production methods.", heading: "Understand how drinkware is manufactured", paragraphs: ["Explore forming, welding, vacuum, coating, printing and assembly methods used across different product structures."], bullets: ["Body forming and welding", "Vacuum insulation", "Surface finishing", "Logo decoration"] },
  "buyer-reference-technical-knowledge": { title: "Buyer Reference & Technical Knowledge", description: "Technical references for selecting and specifying custom drinkware.", heading: "Make better product and sourcing decisions", paragraphs: ["Buyer references explain materials, structures, testing, branding and packaging in practical commercial terms."], bullets: ["Material and capacity selection", "Lid and drinking systems", "Decoration methods", "Testing and quality control"] },
  "quality-control-testing": {
    title: "Quality Control & Testing",
    description: "Quality checks for stainless steel drinkware, lids, coatings, printing, insulation and packaging.",
    heading: "Reduce risk before shipment",
    paragraphs: ["Quality checkpoints are matched to the product structure, customization method and buyer requirements."],
    bullets: ["Material and component inspection", "Vacuum insulation and temperature-retention testing", "Lid fit, leak and function testing", "Coating adhesion and surface appearance checks", "Logo position, colour and durability review", "Carton, label and packaging verification"],
  },
  faq: {
    title: "FAQ & Help Center",
    description: "Frequently asked questions about MOQ, samples, branding, production, packaging and delivery.",
    heading: "Questions before you order",
    paragraphs: ["Selected stock-model logo orders can start from 50 pieces. Samples are normally prepared in 3–7 days after product and artwork confirmation."],
    bullets: ["Laser engraving, screen printing and UV printing", "Selected stock colours may be mixed", "White, kraft, colour and gift-box packaging", "Courier, air and sea delivery options"],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "How FlaskWholesale handles information submitted through this website.",
    heading: "Privacy and inquiry information",
    paragraphs: ["Information you voluntarily provide through this website or WhatsApp is used to respond to inquiries, prepare quotations, coordinate samples and orders, and provide related support.", "This website does not sell personal information. Data may be shared only with service providers necessary to fulfil a request, subject to applicable agreements and law."],
    bullets: [],
  },
};
