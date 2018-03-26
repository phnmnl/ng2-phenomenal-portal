import { CloudProvider } from '../cloud-provider';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpenstackConfig } from '../../shared/service/cloud-provider-metadata/openstack-config';
import { OpenStackCredentials } from "../../shared/service/cloud-provider-metadata/OpenStackCredentials";
import { CloudProviderMetadataService } from '../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service';

@Component({
  selector: 'ph-ostack-setup',
  templateUrl: './ostack-setup.component.html',
  styleUrls: ['./ostack-setup.component.scss']
})
export class OstackSetupComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  private form: FormGroup;
  private hidePassword: boolean = true;
  private credentialsValidated: boolean = false;
  private cloudProviderSettingsForm: boolean;
  private showValidationSucceededMessage: boolean = false;
  private validatingCredentials: boolean = false;

  // OStack properties
  private authUrl: string;
  private projectName: string;
  private tenantName: string;
  private rcVersion: string;
  private domainName: string;
  private flavors = null;
  private networks = null;
  private ipPools = null;


  formErrors = {
    'username': '',
    'password': '',
    'tenantName': '',
    'authURL': '',
    'flavor': '',
    'network': '',
    'ipPool': '',
    'userDomainName': '',
    'rcFile': ''
  };

  validationMessages = {
    'username': {
      'required': 'Username is required.'
    },
    'password': {
      'required': 'Password is required.'
    },
    'tenantName': {
      'required': 'Tenant Name is required.'
    },
    'authURL': {
      'required': 'Auth URL is required.'
    },
    'flavor': {
      'required': 'Flavor is required.'
    },
    'network': {
      'required': 'Network is required.'
    },
    'ipPool': {
      'required': 'IP Pool Name is required.'
    },
    'userDomainName': {
      'required': 'User Domain Name is required.'
    },
    'rcFile': {
      'required': 'RC file is required.'
    }
  };

  constructor(private fb: FormBuilder,
              private cpm: CloudProviderMetadataService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'password': ['', Validators.required],
      'flavor': ['', [Validators.required]],
      'network': ['', [Validators.required]],
      'ipPool': ['', [Validators.required]],
      'rcFile': ['', Validators.required],
    });

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

    if (this.cloudProvider.credential.password && this.cloudProvider.credential.rc_file) {
      this.cloudProviderSettingsForm = true;
      this.credentialsValidated = true;
      this.showCloudProviderSettings();
    }
  }

  validateCredentialsAndShowCloudProviderSettings() {
    this.validateCloudProviderCredentials(() => {
      this.showCloudProviderSettings(1000)
    });
  }

  showCloudProviderSettings(timeout: number = 0) {
    this.getFlavors();
    this.getNetworks();
    this.getIPPools();
    setTimeout(() => {
      this.cloudProviderSettingsForm = true;
      this.showValidationSucceededMessage = false;
    }, timeout);
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;

    for (const field of Object.keys(this.formErrors)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }

    // parse the RC file to retrieve all the information required to connect to the TSI portal
    if (this.cloudProvider.credential.password)
      this.credentials = this.cpm.parseRcFile(
        this.cloudProvider.credential.rc_file, this.cloudProvider.credential.password
      );
  }

  public validateCloudProviderCredentials(callback?) {
    let c = this.cloudProvider.credential;
    if (c.password && c.rc_file) {
      this.formErrors["rcFile"] = "";
      this.validatingCredentials = true;
      const openstackConfig = this.getOpenStackConfiguration();
      this.cpm.getIPPools(
        openstackConfig
      ).subscribe(
        (data) => {
          this.credentialsValidated = true;
          this.validatingCredentials = false;
          this.showValidationSucceededMessage = true;
          this.formErrors["rcFile"] = "";
          if (callback) callback();
        },
        (error) => {
          console.log(error);
          this.formErrors["rcFile"] = "Authentication error: RC file or password not correct!";
          this.credentialsValidated = false;
          this.validatingCredentials = false;
          this.showValidationSucceededMessage = false;
        }
      );
    }
  }

  public enableCloudProviderSettingsSelection() {
    let c = this.cloudProvider.credential;
    return c.password && c.rc_file;
  }

  public cloudProviderSettingsSelected() {
    let c = this.cloudProvider.credential;
    return c.flavor && c.network && c.ip_pool;
  }

  submit() {
    console.log("Submitting ....", this.cloudProvider);

    this.cloudProvider.credential.url = this.authUrl;
    this.cloudProvider.credential.tenant_name = this.tenantName || this.projectName;

    this.cloudProvider.isSelected = 2;
    this.cloudProviderChange.emit(this.cloudProvider);
  }


  get isWaiting() {
    return !this.flavors || !this.networks || !this.ipPools;
  }

  getFlavors() {
    this.flavors = null;
    const openstackConfig = this.getOpenStackConfiguration();
    this.cpm.getFlavors(
      openstackConfig
    ).subscribe(
      (data) => {
        this.flavors = data;
      },
      this.handleLoadingError
    );
  }

  getNetworks() {
    this.networks = null;
    const openstackConfig = this.getOpenStackConfiguration();

    this.cpm.getNetworks(
      openstackConfig
    ).subscribe(
      (data) => {
        this.networks = data;
      },
      this.handleLoadingError
    );
  }

  getIPPools() {
    this.ipPools = null;
    const openstackConfig = this.getOpenStackConfiguration();
    this.cpm.getIPPools(
      openstackConfig
    ).subscribe(
      (data) => {
        this.ipPools = data;
      },
      this.handleLoadingError
    );
  }

  private handleLoadingError = (error) => {
    console.log(error);
  };


  public goBack() {
    if (!this.cloudProviderSettingsForm) {
      this.cloudProvider.isSelected = 0;
    } else {
      this.cloudProvider.isSelected = 1;
      this.cloudProviderSettingsForm = false;
    }
    // reset retrieved
    this.ipPools = null;
    this.networks = null;
    this.flavors = null;
  }

  private getOpenStackConfiguration(): OpenstackConfig {
    let credentials = this.cloudProvider.credential;
    return new OpenstackConfig(
      credentials.username,
      credentials.password,
      this.tenantName,
      this.domainName,
      this.authUrl,
      this.rcVersion);
  }

  }
}
