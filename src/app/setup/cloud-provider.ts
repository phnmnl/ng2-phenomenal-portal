import {Credential} from './Credential';

export class CloudProvider {
  title: string;
  name: string;
  description: string;
  paymentDescription: string;
  providerDescription: string;
  locationDescription: string;
  logo: string;
  isSelected: number;
  credential: Credential;
}

