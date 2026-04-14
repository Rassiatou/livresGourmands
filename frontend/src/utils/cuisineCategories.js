export const CUISINE_CATEGORY_LABELS = {
  1: "Pâtisserie et desserts",
  2: "Cuisine du monde",
  3: "Cuisine saine et veggie",
  4: "Cuisine rapide du quotidien",
  5: "Techniques et bases",
};

export function toCuisineCategoryLabel(id, fallback = "Cuisine") {
  return CUISINE_CATEGORY_LABELS[Number(id)] || fallback;
}
