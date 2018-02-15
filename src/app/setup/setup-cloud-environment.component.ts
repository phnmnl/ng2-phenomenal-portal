import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  Provider
} from '@angular/core';
import { ApplicationService, CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';
import { CloudProvider } from './cloud-provider';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../shared/service/user/user.service';
import { User } from "../shared/service/user/user";
import { ProviderRegistry } from "../shared/service/deployer/provider-registry";

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


  private smallScreen;
  private onChangeScreenListener;


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

    // set the current screen type
    this.smallScreen = window.innerWidth < 990;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.smallScreen = event.target.innerWidth < 990;
  }

  ngOnDestroy() {
    this._queryParamChangeListener.unsubscribe();
  }

  initializeProviders() {
    console.log("Generating providers...");
    this._cloudProviderCollection = ProviderRegistry.getProviders();
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
