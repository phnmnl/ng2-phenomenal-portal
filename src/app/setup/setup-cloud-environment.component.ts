import { ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ApplicationService, CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';
import { CloudProvider } from './cloud-provider';
import { Router } from '@angular/router';
import { UserService } from '../shared/service/user/user.service';
import { User } from "../shared/service/user/user";

@Component({
  selector: 'ph-setup-cloud-environment',
  templateUrl: './setup-cloud-environment.component.html',
  styleUrls: ['./setup-cloud-environment.component.css'],
  providers: [UserService]
})
export class SetupCloudEnvironmentComponent implements OnInit {

  private currentUser: User = new User({"username": "pino"});
  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';
  // private _galaxy_instance_url = 'http://193.62.54.91:30700';
  // private _galaxy_api_key = 'b5d33930050dad02d448271c5ab7f80e';
  // _isFailed = false;
  // _isSuccess = false;
  // private _message = '';
  private _cloudProviderCollection: CloudProvider[];
  // _aws_region: AwsRegion[];
  // _gcp_region: AwsRegion[];
  // private _provider: CloudProvider;

  //
  // get provider(): CloudProvider {
  //   return this._provider;
  // }
  //
  // set provider(value: CloudProvider) {
  //   this._provider = value;
  // }

  get cloudProviderCollection(): CloudProvider[] {
    return this._cloudProviderCollection;
  }

  // get galaxy_api_key(): string {
  //   return this._galaxy_api_key;
  // }
  //
  // get galaxy_instance_url(): string {
  //   return this._galaxy_instance_url;
  // }

  constructor(private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              private router: Router,
              public userService: UserService,
              private ref: ChangeDetectorRef,
              private zone: NgZone) {


    this.userService.currentUserObservable.subscribe(user => {
      console.log("Updating the current user", user);
      this.currentUser = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this.currentUser.hasGalaxyAccount);
        console.log("Updated user @ CloudSetupEnvironment", user, this.currentUser)
      }
    });

    // this._aws_region = [
    //   {value: 'eu-west-1', displayValue: 'EU (Ireland)'},
    //   {value: 'eu-central-1', displayValue: 'EU (Frankfurt)'},
    //   {value: 'eu-west-2', displayValue: 'EU (London)'},
    //   {value: 'us-east-1', displayValue: 'US East (N. Virginia)'},
    //   {value: 'us-east-2', displayValue: 'US East (Ohio)'},
    //   {value: 'us-west-1', displayValue: 'US West (N. California)'},
    //   {value: 'us-west-2', displayValue: 'US West (Oregon)'},
    //   {value: 'ca-central-1', displayValue: 'Canada (Central)'}
    // ];
    //
    // this._gcp_region = [
    //   {value: 'us-west1-a', displayValue: 'Western US'},
    //   {value: 'us-central1-a', displayValue: 'Central US'},
    //   {value: 'us-east1-b', displayValue: 'Eastern US'},
    //   {value: 'europe-west1-b', displayValue: 'Western Europe'},
    //   {value: 'asia-east1-a', displayValue: 'Eastern Asia-Pacific'},
    //   {value: 'asia-northeast1-a', displayValue: 'Northeastern Asia-Pacific'}
    // ];

    this._cloudProviderCollection = [
      {
        title: 'PhenoMeNal Cloud',
        name: 'phenomenal',
        help: '/help/Deployment-Cloud-Research-Environment',
        description: 'Your data will be stored on the PhenoMeNal Cloud with computing power by PhenoMeNal partners. ' +
        'This is not suitable for sensitive or private data. Uploaded data will be kept for a limited amount of time only.',
        paymentDescription: 'Free',
        providerDescription: 'EMBL-EBI, Uppsala Uni',
        locationDescription: 'Europe',
        logo: this._phenomenal_logo,
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
      },
      {
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
      },
      {
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
      },
      {
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
      }
    ];

    if (this.tokenService.getToken()) {
      this.getAllApplication((result) => {
        if (result.status === 401 || result.type === 'error') {
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }

  logout() {
    this.tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {
  }

  getAllApplication(callback) {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      app => {
        // console.log('[RepositoryComponent] getAll %O', app);
        callback(app);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        callback(error);
      }
    );
  }
}
