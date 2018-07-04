import { ChangeDetectorRef, Component, EventEmitter, HostListener, NgZone, OnInit, Output } from '@angular/core';
import { User } from "../../shared/service/user/user";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProviderRegistry } from "../../shared/service/deployer/provider-registry";
import { CloudProvider } from "../cloud-provider";
import { ApplicationService, CredentialService, TokenService } from "ng2-cloud-portal-service-lib";
import { UserService } from "../../shared/service/user/user.service";
import { ActivatedRoute, Router } from "@angular/router";


@Component({
  selector: 'ph-provider-selector',
  templateUrl: './provider-selector.component.html',
  styleUrls: ['./provider-selector.component.scss']
})
export class ProviderSelectorComponent implements OnInit {

  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  private _cloudProviderCollection: CloudProvider[];
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
              public credentialService: CredentialService,
              public tokenService: TokenService,
              private route: ActivatedRoute,
              private router: Router,
              public userService: UserService,
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
    this.form.valueChanges.subscribe(value => {
      console.log("Value changed -->", value);
      console.log("Cloud provider from form valueChange", this.selectedCloudProvider);
      this.cloudProvider.emit(this.selectedCloudProvider);
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
    this._cloudProviderCollection = ProviderRegistry.getProviders();
  }

  get cloudProviderCollection(): CloudProvider[] {
    return this._cloudProviderCollection;
  }

  public isCloudProviderSelected() {
    return this.selectedCloudProvider && this.selectedCloudProvider.isSelected > 0;
  }

  selectCloudProvider(provider: CloudProvider) {
    if (provider.name === "phenomenal")
      this.router.navigateByUrl('/cloud-research-environment-test');
    else {
      console.log("Selected provider", provider);
      this.selectedCloudProvider = CloudProvider.clone(provider);
      this.selectedCloudProvider.isSelected = 1;
      console.log("Selected CloudProvider", this.selectedCloudProvider);
      this.cloudProviderName = provider.name;
      console.log("Event emitted!");
    }
  }

  onChange() {
    console.log("Form changed!!!");
    this.validateAllFormFields(this.form);
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
