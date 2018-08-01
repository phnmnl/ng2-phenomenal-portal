import { CloudProvider } from "../deployer/cloud-provider";

export class ProviderRegistry {

  private static _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private static _aws_logo = 'assets/img/logo/aws_logo.png';
  private static _gce_logo = 'assets/img/logo/gce_logo.png';

  public static getPhenomenalProvider(): CloudProvider {
    return new CloudProvider({
      title: 'PhenoMeNal Cloud',
      name: 'phenomenal',
      help: '/help/Deployment-Cloud-Research-Environment',
      description: 'Note that this is a public instance accessible by everyone. Your data will be stored on the PhenoMeNal Cloud with computing power by PhenoMeNal partners. ' +
        'This is not suitable for sensitive or private data. Uploaded data will be kept for a limited amount of time only.',
      paymentDescription: 'Free',
      providerDescription: 'EMBL-EBI, Uppsala Uni',
      locationDescription: 'Europe',
      logo: {
        'path': 'assets/img/logo/default_app.png',
        'width': "200px",
        'height': "125px"
      }
    });
  }

  public static getAwsProvider(): CloudProvider {
    return new CloudProvider({
      title: 'AWS',
      name: 'aws',
      help: '/help/How-to-obtain-AWS-credentials',
      description: 'Amazon WS is a commercial cloud provider. Use this if you already have an Amazon AWS account.',
      paymentDescription: 'Commercial',
      providerDescription: 'Amazon AWS',
      locationDescription: 'Worldwide',
      logo: {
        "path": this._aws_logo,
        'width': "200px",
        'height': "125px"
      },
      credential: {'default_region': "eu-west-1"}
    });
  }

  public static getOpenStackProvider(): CloudProvider {
    return new CloudProvider({
      title: 'OpenStack',
      name: 'ostack',
      help: '/help/How-to-obtain-OpenStack-credentials',
      description: 'Your Cloud Research Environment can be deployed at any OpenStack cloud you have an account for.',
      paymentDescription: 'Commercial or Free',
      providerDescription: 'N/a',
      locationDescription: 'N/a',
      logo: {
        'path': this._openstack_logo,
        'width': "200px",
        'height': "125px"
      }
    });
  }

  public static getGcpProvider(): CloudProvider {
    return new CloudProvider({
      title: 'Google Cloud Platform',
      name: 'gcp',
      help: '/help/How-to-obtain-GCE-credentials',
      description: 'Google Cloud Platform is a commercial cloud provider. Use this if you already have an GCP account.',
      paymentDescription: 'Commercial',
      providerDescription: 'Google Cloud',
      locationDescription: 'Worldwide',
      logo: {
        path: this._gce_logo,
        width: "200px",
        height: "125px"
      }
    });
  }

  public static getOpenStackProviders(): CloudProvider[] {
    return null;
  }

  public static getProviders() {
    return [
      this.getPhenomenalProvider(),
      this.getAwsProvider(),
      this.getGcpProvider(),
      this.getOpenStackProvider()
    ];
  }
}
