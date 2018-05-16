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

  public static clone(origin: CloudProvider): CloudProvider {
    let c: CloudProvider = Object.assign({}, origin);
    c.credential = Object.assign({}, origin.credential);
    return c;
  }
}

