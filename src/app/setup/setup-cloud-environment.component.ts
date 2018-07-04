import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  Provider, ViewChild
} from '@angular/core';
import { ApplicationService, CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';
import { CloudProvider } from './cloud-provider';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../shared/service/user/user.service';
import { User } from "../shared/service/user/user";
import { ProviderRegistry } from "../shared/service/deployer/provider-registry";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProviderSelectorComponent } from "./provider-selector/provider-selector.component";
import { MatStepper } from "@angular/material";
import { ProviderCredentialsComponent } from "./provider-credentials/provider-credentials.component";
import { ProviderParametersComponent } from "./provider-parameters/provider-parameters.component";
import { ServicesCredentialsComponent } from "./services-credentials/services-credentials.component";
import { DeployConfirmComponent } from "./deploy-confirm/deploy-confirm.component";
import { Deployment } from "../shared/service/deployer/deployment";
import { DeployementService } from "../shared/service/deployer/deployement.service";
import { AppConfig } from "../app.config";


@Component({
  selector: 'ph-setup-cloud-environment',
  templateUrl: './setup-cloud-environment.component.html',
  styleUrls: ['./setup-cloud-environment.component.css']
})
export class SetupCloudEnvironmentComponent implements OnInit, OnDestroy {

  @ViewChild(ProviderSelectorComponent) stepOneComponent: ProviderSelectorComponent;
  @ViewChild(ProviderCredentialsComponent) stepTwoComponent: ProviderCredentialsComponent;
  @ViewChild(ProviderParametersComponent) stepThreeComponent: ProviderParametersComponent;
  @ViewChild(ServicesCredentialsComponent) stepFourComponent: ServicesCredentialsComponent;
  @ViewChild(DeployConfirmComponent) stepFiveComponent: DeployConfirmComponent;


  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  private static cloudProviderLogo = {
    'aws': 'assets/img/logo/aws_logo.png',
    'gcp': 'assets/img/logo/gce_logo.png',
    'ostack': 'assets/img/logo/openstack_logo.png',
    'phenomenal': 'assets/img/logo/default_app.png'
  };

  errors = [];

  private _cloudProviderCollection: CloudProvider[];
  private selectedCloudProvider: CloudProvider = null;

  // Listener of query param changes
  private _queryParamChangeListener;

  @ViewChild(MatStepper) stepper: MatStepper;


  private smallScreen;
  private onChangeScreenListener;

  //
  // firstFormGroup: FormGroup;
  // secondFormGroup: FormGroup;

  currentUser: User = new User({});

  constructor(private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              private appConfig: AppConfig,
              private route: ActivatedRoute,
              private router: Router,
              public userService: UserService,
              private ref: ChangeDetectorRef,
              private zone: NgZone,
              private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef,
              private credentialsService: CredentialService,
              private deploymentService: DeployementService) {
  }


  get formOne(): FormGroup {
    return this.stepOneComponent ? this.stepOneComponent.form : null;
  }

  get formTwo(): FormGroup {
    return this.stepTwoComponent ? this.stepTwoComponent.form : null;
  }

  get formThree(): FormGroup {
    return this.stepThreeComponent ? this.stepThreeComponent.form : null;
  }

  get formFour(): FormGroup {
    return this.stepFourComponent ? this.stepFourComponent.form : null;
  }

  get formFive(): FormGroup {
    return this.stepFiveComponent ? this.stepFiveComponent.form : null;
  }

  get cloudProvider(): CloudProvider {
    return this.selectedCloudProvider;
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

    // update list of deployments before creating new ones
    this.deploymentService.updateDeployments();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.smallScreen = event.target.innerWidth < 990;
  }

  ngOnDestroy() {
    this._queryParamChangeListener.unsubscribe();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  initializeProviders() {
    console.log("Generating providers...");
    this._cloudProviderCollection = ProviderRegistry.getProviders();
  }

  private cleanErrors() {
    this.errors.splice(0, this.errors.length);
  }

  private addError(error: string) {
    this.errors.push(error);
  }

  get cloudProviderCollection(): CloudProvider[] {
    return this._cloudProviderCollection;
  }

  public isCloudProviderSelected() {
    return this.selectedCloudProvider && this.selectedCloudProvider.isSelected > 0;
  }

  get cloudProviderLogo(): string {
    return !this.cloudProvider ? "" : SetupCloudEnvironmentComponent.cloudProviderLogo[this.cloudProvider.name];
  }

  selectCloudProvider(provider: CloudProvider) {
    if (!provider) return;
    if (provider.name === "phenomenal")
      this.router.navigateByUrl('/cloud-research-environment-test');
    else {
      console.log("Selected provider", provider);
      this.selectedCloudProvider = CloudProvider.clone(provider);
      this.selectedCloudProvider.isSelected = 1;
      console.log("[Stepper] Selected CloudProvider ", this.selectedCloudProvider);
      console.log("Is Valid: ", this.formOne.valid);
      this.cleanErrors();
      this.ngAfterViewChecked();
      this.stepper.next();
    }
  }

  validateCredentials() {
    this.stepTwoComponent.validateCredentials(
      () => {
        this.stepper.next();
      },
      (error: object) => {
        console.log("Detected error ", error);
      }
    );
  }

  deploy() {
    this.cloudProvider.credential.username = this.credentialsService.getUsername();
    let deployment = Deployment.buildFromConfigurationParameters(this.appConfig, this.cloudProvider.credential);
    this.deploymentService.deploy(deployment);
    this.router.navigateByUrl('/cloud-research-environment-dashboard');
  }

}
