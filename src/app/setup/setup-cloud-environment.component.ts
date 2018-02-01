import { ApplicationRef, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ApplicationService, CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';
import { CloudProvider } from './cloud-provider';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../shared/service/user/user.service';
import { User } from "../shared/service/user/user";

@Component({
  selector: 'ph-setup-cloud-environment',
  templateUrl: './setup-cloud-environment.component.html',
  styleUrls: ['./setup-cloud-environment.component.css']
})
export class SetupCloudEnvironmentComponent implements OnInit, OnDestroy {

  private currentUser: User = new User({"username": "pino"});
  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  private _cloudProviderCollection: CloudProvider[];
  private selectedCloudProvider: CloudProvider = null;

  // Listener of query param changes
  private _queryParamChangeListener;


  constructor(private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              private route: ActivatedRoute,
              private router: Router,
              public userService: UserService,
              private ref: ChangeDetectorRef,
              private zone: NgZone) {
  }

  ngOnInit() {
    // subscribe to query params
    this._queryParamChangeListener = this.route
      .queryParams
      .subscribe(params => {
        console.log("Component params", params);
        this.selectedCloudProvider = null;
        // reset state
        this.initializeProviders();
        this.selectedCloudProvider = null;
      });
    // subscribe to user updates
    this.userService.getObservableCurrentUser().subscribe(user => {
      console.log("Updating the current user", user);
      this.currentUser = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this.currentUser.hasGalaxyAccount);
        console.log("Updated user @ CloudSetupEnvironment", user, this.currentUser)
      }
    });
    // set the current user
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnDestroy() {
    this._queryParamChangeListener.unsubscribe();
  }

  initializeProviders() {
    console.log("Generating providers...");
    this._cloudProviderCollection = [
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
  }

  get cloudProviderCollection(): CloudProvider[] {
    return this._cloudProviderCollection;
  }

  public isCloudProviderSelected() {
    return this.selectedCloudProvider && this.selectedCloudProvider.isSelected > 0;
  }

  selectCloudProvider(provider: CloudProvider) {
    this.selectedCloudProvider = provider;
    this.selectedCloudProvider.isSelected = 1;
    console.log("Selected CloudProvider", provider);
  }
}
