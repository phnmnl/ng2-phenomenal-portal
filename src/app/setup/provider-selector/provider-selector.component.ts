import { User } from "../../shared/service/user/user";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../shared/service/user/user.service";
import { CloudProvider } from "../../shared/service/deployer/cloud-provider";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ApplicationService, CredentialService, TokenService } from "ng2-cloud-portal-service-lib";
import { ChangeDetectorRef, Component, EventEmitter, HostListener, NgZone, OnInit, Output } from '@angular/core';
import { CloudProviderCatalogService } from "../../shared/service/cloud-provider-catalog/cloud-provider-catalog.service";


@Component({
  selector: 'ph-provider-selector',
  templateUrl: './provider-selector.component.html',
  styleUrls: ['./provider-selector.component.scss']
})
export class ProviderSelectorComponent implements OnInit {

  private _cloudProviderCollection: CloudProvider[];
  private _preconfiguredCloudProviderCollection: CloudProvider[];
  selectedCloudProvider: CloudProvider = null;

  @Output() cloudProvider = new EventEmitter<CloudProvider>();

  // Listener of query param changes
  private _queryParamChangeListener;


  private smallScreen;
  private onChangeScreenListener;

  cloudProviderName: string;

  form: FormGroup;


  currentUser: User = new User({});

  constructor(private _applicationService: ApplicationService,
              private credentialService: CredentialService,
              private catalogService: CloudProviderCatalogService,
              private tokenService: TokenService,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private ref: ChangeDetectorRef,
              private zone: NgZone,
              private _formBuilder: FormBuilder) {
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

    this.form = this._formBuilder.group({
      cloudProvider: ['', Validators.required]
    });
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
    this._cloudProviderCollection = this.catalogService.getProviders();
    console.log("Public Providers", this._cloudProviderCollection);
    this.catalogService.getPreconfiguredProviders().subscribe((providers) => {
      this._preconfiguredCloudProviderCollection = providers;
      console.log("Preconfigured providers", providers);
    });
  }

  get cloudProviderCollection(): CloudProvider[] {
    return this._cloudProviderCollection;
  }

  get preconfiguredCloudProviderCollection(): CloudProvider[] {
    return this._preconfiguredCloudProviderCollection;
  }

  selectCloudProvider(provider: CloudProvider) {
    if (provider.name === "phenomenal")
      this.router.navigateByUrl('/cloud-research-environment-test');
    else {
      console.log("Selected provider", provider);
      this.selectedCloudProvider = CloudProvider.clone(provider);
      this.cloudProviderName = provider.name;
      this.cloudProvider.emit(this.selectedCloudProvider);
      console.log("Event emitted!");
    }
  }

  onChange() {
    console.log("Form changed!!!");
    this.validateAllFormFields(this.form);
  }

  onSubmit() {
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      console.log("Validating control", control);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
    console.log("Form validated", formGroup, formGroup.valid);
  }
}
