export function splitVariantLabel(label) {
  const match = label.match(/^(\d+(?:\.\d+)?oz)\s*(\(\d+ml\))$/i);
  return match ? {primary:match[1],secondary:match[2]} : {primary:label,secondary:""};
}
