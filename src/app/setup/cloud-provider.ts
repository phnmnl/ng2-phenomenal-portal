import {Credential} from './Credential';

export class CloudProvider {
  title: string;
  description: string;
  paymentDescription: string;
  providerDescription: string;
  locationDescription: string;
  logo: string;
  isSelected: boolean;
  credential: Credential;
}

