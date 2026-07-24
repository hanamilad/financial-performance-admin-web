const currency = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: string | number): string {
  return currency.format(Number(value));
}

export function formatNumber(value: string | number): string {
  return integer.format(Number(value));
}

export function formatPercent(fraction: string | number): string {
  return `${decimal.format(Number(fraction) * 100)}%`;
}
