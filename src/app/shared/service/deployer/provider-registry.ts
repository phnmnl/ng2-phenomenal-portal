import { CloudProvider } from "../../../setup/cloud-provider";

export class ProviderRegistry {

  private static _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private static _aws_logo = 'assets/img/logo/aws_logo.png';
  private static _gce_logo = 'assets/img/logo/gce_logo.png';

  public static getPhenomenalProvider(): CloudProvider {
    return <CloudProvider>{
      title: 'PhenoMeNal Cloud',
      name: 'phenomenal',
      help: '/help/Deployment-Cloud-Research-Environment',
      description: 'Note that this is a public instance accessible by everyone. Your data will be stored on the PhenoMeNal Cloud with computing power by PhenoMeNal partners. ' +
      'This is not suitable for sensitive or private data. Uploaded data will be kept for a limited amount of time only.',
      paymentDescription: 'Free',
      providerDescription: 'EMBL-EBI, Uppsala Uni',
      locationDescription: 'Europe',
      logo: 'assets/img/logo/default_app.png',
      isSelected: 0,
      credential: {
        username: '',
        password: '',
        tenant_name: '',
        url: '',
        provider: '',
        galaxy_admin_username: '',
        galaxy_admin_email: '',
        galaxy_admin_password: '',
        jupyter_password: ''
      }
    };
  }

  public static getAwsProvider(): CloudProvider {
    return <CloudProvider>{
      title: 'AWS',
      name: 'aws',
      help: '/help/How-to-obtain-AWS-credentials',
      description: 'Amazon WS is a commercial cloud provider. Use this if you already have an Amazon AWS account.',
      paymentDescription: 'Commercial',
      providerDescription: 'Amazon AWS',
      locationDescription: 'Worldwide',
      logo: this._aws_logo,
      isSelected: 0,
      credential: {
        username: '',
        password: '',
        tenant_name: '',
        url: '',
        provider: 'AWS',
        galaxy_admin_username: '',
        galaxy_admin_email: '',
        galaxy_admin_password: '',
        jupyter_password: '',
        access_key_id: '',
        secret_access_key: '',
        default_region: ''
      }
    };
  }

  public static getOpenStackProvider(): CloudProvider {
    return <CloudProvider>{
      title: 'OpenStack',
      name: 'ostack',
      help: '/help/How-to-obtain-OpenStack-credentials',
      description: 'Your Cloud Research Environment can be deployed at any OpenStack cloud you have an account for.',
      paymentDescription: 'Commercial or Free',
      providerDescription: 'N/a',
      locationDescription: 'N/a',
      logo: this._openstack_logo,
      isSelected: 0,
      credential: {
        username: '',
        password: '',
        tenant_name: '',
        url: '',
        provider: 'OSTACK',
        galaxy_admin_username: '',
        galaxy_admin_email: '',
        galaxy_admin_password: '',
        jupyter_password: ''
      }
    };
  }

  public static getGooglProvider(): CloudProvider {
    return <CloudProvider>{
      title: 'Google Cloud Platform',
      name: 'gcp',
      help: '/help/How-to-obtain-GCE-credentials',
      description: 'Google Cloud Platform is a commercial cloud provider. Use this if you already have an GCP account.',
      paymentDescription: 'Commercial',
      providerDescription: 'Google Cloud',
      locationDescription: 'Worldwide',
      logo: this._gce_logo,
      isSelected: 0,
      credential: {
        username: '',
        password: '',
        tenant_name: '',
        url: '',
        provider: 'GCP',
        galaxy_admin_username: '',
        galaxy_admin_email: '',
        galaxy_admin_password: '',
        jupyter_password: '',
        access_key_id: '',
        default_region: ''
      }
    };
  }

  public static getProviders() {
    return [
      this.getPhenomenalProvider(),
      this.getAwsProvider(),
      this.getGooglProvider(),
      this.getOpenStackProvider()
    ];
  }
}
