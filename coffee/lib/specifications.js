// Only standalone pricing fields are removed; ordinary product specifications remain.
export function isPriceSpecification(label = "") {
  return /^(?:(?:unit|product|base|wholesale|exw|reference|indicative|retail|fob)[ -]+)*(?:prices?|pricing)(?:\s+per\s+(?:unit|piece|pc))?(?:\s*\([^)]*\))?(?:\s*[:：].*)?$/i.test(label.trim());
}
export function removePriceSpecifications(text = "") {
  return text.split(/\r?\n\s*\r?\n/).filter(block => !isPriceSpecification(block.trim().split(/\r?\n/)[0])).join("\n\n");
}
export function parseSpecItems(text = "") {
  return removePriceSpecifications(text).split(/\r?\n\s*\r?\n/).map(block => {
    const [label = "", ...values] = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    return {label, value: values.join("\n")};
  }).filter(item => item.label && item.value && !isPriceSpecification(item.label));
}
