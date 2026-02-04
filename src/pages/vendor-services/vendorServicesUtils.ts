export const formatCurrency = (value: number | null | undefined) =>
  value != null
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(value)
    : "-";

