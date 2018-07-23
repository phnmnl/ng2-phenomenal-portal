import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { User } from "../../shared/service/user/user";
import { FormGroup } from "@angular/forms";
import { UserService } from "../../shared/service/user/user.service";
import { CloudProvider } from "../../shared/service/deployer/cloud-provider";
import { AppConfig } from "../../app.config";
import { AwsProviderCredentialsComponent } from "./aws-provider-credentials/aws-provider-credentials.component";
import { BaseProviderCredentialsComponent } from "./base-provider-credentials/base-provider-credentials.component";
import { CloudProviderMetadataService } from "../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service";
import { OpenstackProviderCredentialsComponent } from "./openstack-provider-credentials/openstack-provider-credentials.component";
import { GcpProviderCredentialsComponent } from "./gcp-provider-credentials/gcp-provider-credentials.component";
import { PreconfiguredOpenstackProviderCredentialsComponent } from "./preconfigured-openstack-provider-credentials/preconfigured-openstack-provider-credentials.component";

@Component({
  selector: 'ph-provider-credentials',
  templateUrl: './provider-credentials.component.html',
  styleUrls: ['./provider-credentials.component.scss']
})
export class ProviderCredentialsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() cloudProvider: CloudProvider;
  @ViewChild(AwsProviderCredentialsComponent) awsSetup: AwsProviderCredentialsComponent;
  @ViewChild(GcpProviderCredentialsComponent) gcpSetup: GcpProviderCredentialsComponent;
  @ViewChild(OpenstackProviderCredentialsComponent) ostackSetup: OpenstackProviderCredentialsComponent;
  @ViewChild(PreconfiguredOpenstackProviderCredentialsComponent) preconfiguredOstackSetup: PreconfiguredOpenstackProviderCredentialsComponent;

  private user: User;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  errors = [];
  lastFormGroup: FormGroup = null;
  errorsSubscription = null;


  constructor(public userService: UserService,
              private config: AppConfig,
              private cdRef: ChangeDetectorRef,
              private service: CloudProviderMetadataService) {
    this.user = this.userService.getCurrentUser();
    console.log("Current user: ", this.user);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.userService.getObservableCurrentUser().subscribe(user => {
      this.user = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this.user.hasGalaxyAccount);
      }
      console.log("Updated user @ CloudSetupComponent", user, this.user)
    });
    console.log("Cloud provider user", this.user);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("Changes detected", changes);
    console.log("**** COMPONENT: ", this.providerCredentialsComponent);
  }

  ngOnDestroy(): void {
    if (this.errorsSubscription)
      this.errorsSubscription.unsubscribe();
  }


  get providerCredentialsComponent(): BaseProviderCredentialsComponent {
    return this[(this.cloudProvider.preconfigured
      ? "preconfigured" + ProviderCredentialsComponent.capitalizeFirstLetter(this.cloudProvider.name)
      : this.cloudProvider.name) + "Setup"];
  }

  get form(): FormGroup {
    let form: FormGroup = this.providerCredentialsComponent ? this.providerCredentialsComponent.form : null;
    if (this.lastFormGroup !== form) {
      if (this.errorsSubscription) {
        this.errorsSubscription.unsubscribe();
      }
      this.errorsSubscription = this.providerCredentialsComponent.errorsAsObservable.subscribe((errors) => {
        this.errors = errors;
      });
      this.lastFormGroup = form;
    }
    return form;
  }

  public validateCredentials(onSuccess?, onError?) {
    this.errors = [];
    this.service.authenticate(this.cloudProvider)
      .subscribe((data) => {
        console.log(data);
        if (onSuccess) onSuccess(data);
      }, (error) => {
        console.error(error);
        this.errors.push("AUTHENTICATION FAILURE: credentials not valid!");
        if (onError) onError(error);
      });
  }

  get galaxy_instance_url(): string {
    console.debug("Galaxy instance URL:", this.config.getConfig("galaxy_url"));
    return this.config.getConfig("galaxy_url") + "/user/login";
  }

  private static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
