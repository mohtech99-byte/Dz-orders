import type { DeliveryProvider } from './types';
import { yalidineProvider } from './yalidine';

const PROVIDERS: DeliveryProvider[] = [yalidineProvider];

export function getProviderForCompany(companyName: string): DeliveryProvider | null {
  return PROVIDERS.find((provider) => provider.companyName.toLowerCase() === companyName.toLowerCase()) ?? null;
}
