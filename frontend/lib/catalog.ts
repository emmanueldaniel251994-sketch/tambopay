export const services = [
  { id: 'airtime', label: 'Airtime', icon: '📱', detail: 'Top up any network' },
  { id: 'data', label: 'Data', icon: '📶', detail: 'All data bundles' },
  { id: 'electricity', label: 'Electricity', icon: '⚡', detail: 'Buy electricity tokens' },
  { id: 'cable', label: 'Cable TV', icon: '📺', detail: 'DStv, GOtv, Startimes' },
  { id: 'education', label: 'Education', icon: '🎓', detail: 'Education payments' },
  { id: 'other', label: 'Other Bills', icon: '▦', detail: 'More bill payments' }
] as const;
export type ServiceId = typeof services[number]['id'];
export function validateOrder(service: string, reference: string, amount: string): string | null {
  if (!services.some(item => item.id === service)) return 'Select a valid service.';
  if (!/^[a-zA-Z0-9+._ -]{5,60}$/.test(reference.trim())) return 'Enter a valid customer reference (5–60 characters).';
  if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) < 100 || Number(amount) > 1000000) return 'Enter an amount from ₦100 to ₦1,000,000.';
  return null;
}
