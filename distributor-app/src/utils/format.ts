export function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export function formatLeadTime(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day ahead';
  return `${days} days ahead`;
}
