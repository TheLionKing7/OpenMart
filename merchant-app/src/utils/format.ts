export function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}
