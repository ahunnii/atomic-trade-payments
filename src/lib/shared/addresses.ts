import type { Address } from "../../types";

export function normalizeAddress(address: Address): Record<string, string> {
  const fields = [
    "street",
    "additional",
    "city",
    "state",
    "postalCode",
    "country",
  ];
  const normalized: Record<string, string> = {};

  for (const field of fields) {
    const value = address[field as keyof Address];
    normalized[field] = (value ?? "").trim().toLowerCase();
  }

  return normalized;
}

export function addressesAreSame(
  a: Address | null,
  b: Address | null,
): boolean {
  if (!a || !b) return false;

  const normA = normalizeAddress(a);
  const normB = normalizeAddress(b);

  return Object.keys(normA).every((key) => normA[key] === normB[key]);
}
