export function calculateImageBudget({ pageBudgetKb, otherAssetsKb, imageCount, safetyPercent }) {
  const budget = Number(pageBudgetKb);
  const other = Number(otherAssetsKb);
  const count = Number(imageCount);
  const safety = Number(safetyPercent);

  if (![budget, other, count, safety].every(Number.isFinite)) {
    throw new Error("All fields must contain numbers.");
  }
  if (budget <= 0 || other < 0 || !Number.isInteger(count) || count < 1 || safety < 0 || safety >= 100) {
    throw new Error("Use a positive page budget, non-negative other assets, at least one image, and a safety margin below 100%.");
  }

  const usableBudgetKb = budget * (1 - safety / 100);
  const imageBudgetKb = usableBudgetKb - other;
  if (imageBudgetKb <= 0) {
    throw new Error("Other assets already consume the usable page budget.");
  }

  return {
    usableBudgetKb,
    imageBudgetKb,
    perImageKb: imageBudgetKb / count,
    reservedKb: budget - usableBudgetKb,
  };
}
