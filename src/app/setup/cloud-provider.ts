import { Credential } from './credential';

export class CloudProvider {
  title: string;
  name: string;
  help: string;
  description: string;
  paymentDescription: string;
  providerDescription: string;
  locationDescription: string;
  logo: string;
  isSelected: number;
  credential: Credential;
}

