export function createDistributorId(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  return `${base || 'distributor'}-${Date.now().toString(36)}`;
}

export function parseMarketsInput(input: string): string[] {
  return input
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
