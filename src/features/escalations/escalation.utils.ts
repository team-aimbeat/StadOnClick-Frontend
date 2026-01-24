export const formatEscalationLabel = (value: string) => {
  if (!value) return value;
  const normalized = value.replace(/_/g, " ");
  if (normalized.length <= 4 && normalized.toUpperCase() === normalized) {
    return normalized;
  }
  return normalized
    .toLowerCase()
    .split(" ")
    .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : ""))
    .join(" ");
};
