import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CloudProviderMetadataService } from '../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service';
import { OpenstackConfig } from '../../shared/service/cloud-provider-metadata/openstack-config';
import { open } from "fs";

@Component({
  selector: 'ph-ostack-setup',
  templateUrl: './ostack-setup.component.html',
  styleUrls: ['./ostack-setup.component.scss']
})
export class OstackSetupComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  private subforms = {
    "credentials": 1,
    "settings": 2
  };

  private form: FormGroup;
  private hidePassword: boolean = true;
  private credentialsValidated: boolean = false;
  private cloudProviderSettingsForm: boolean;
  private showValidationSucceededMessage: boolean = false;
  private previousSubForm = null;
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
    'userDomainName': ''
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

    this.onValueChanged(); // (re)set validation messages now
  }

  toggleVerify() {
    this.isWaiting = true;
    this.getIPPools();
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

    if (this.form.value['authURL'].substring(this.form.value['authURL'].length - 2,
        this.form.value['authURL'].length).toLocaleLowerCase() === 'v3') {
      this.isUserDomainName = true;
    } else {
      this.isUserDomainName = false;
    }
  }

  onSubmit() {
    this.cloudProvider.isSelected = 2;
    this.cloudProvider.credential.username = this.form.value['username'];
    this.cloudProvider.credential.password = this.form.value['password'];
    this.cloudProvider.credential.tenant_name = this.form.value['tenantName'];
    this.cloudProvider.credential.url = this.form.value['authURL'];
    this.cloudProvider.credential.flavor = this.form.value['flavor'];
    this.cloudProvider.credential.network = this.form.value['network'];
    this.cloudProvider.credential.ip_pool = this.form.value['ipPool'];
  parseRcFile(rcFile: string) {
    if (rcFile) {
      // reset previous values
      this.rcVersion = null;
      this.authUrl = null;
      this.projectName = "";
      this.tenantName = "";
      this.domainName = "";

      // update RC file with the user password and set it as current RC file
      // console.log("The current RC file...", rcFile);
      this.cloudProvider.credential.rc_file = rcFile.replace(
        /read.+/, "export OS_PASSWORD_INPUT=\"" + this.form.value['password'] + "\"");
      console.log("Updated RC file", this.cloudProvider.credential.rc_file);

      // extract all the required RC file fields required to query the TSI portal
      this.cloudProvider.credential.username = this.extractPropertyValue("OS_USERNAME");
      this.rcVersion = this.extractPropertyValue("OS_IDENTITY_API_VERSION");
      this.authUrl = this.extractPropertyValue("OS_AUTH_URL");
      if (this.rcVersion == "2") {
        this.tenantName = this.extractPropertyValue("OS_TENANT_NAME");
      } else if (this.rcVersion == "3") {
        this.projectName = this.extractPropertyValue("OS_PROJECT_NAME");
        this.domainName = this.extractPropertyValue("OS_USER_DOMAIN_NAME");
      }
    }
  }

    this.cloudProviderChange.emit(this.cloudProvider);
  }

  getFlavors() {

    const openstackConfig = new OpenstackConfig(this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2');

    this.cpm.getFlavors(
      openstackConfig
    ).subscribe(
      (data) => {
        this.flavors = data;
        this.isVerify = true;
        this.isWaiting = false;
      },
      (error) => {
        console.log(error);
        this.isWaiting = false;
      }
    );
  }

  getNetworks() {
    const openstackConfig = new OpenstackConfig(this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2');

    this.cpm.getNetworks(
      openstackConfig
    ).subscribe(
      (data) => {
        this.networks = data;
        this.getFlavors();
      },
      (error) => {
        console.log(error);
        this.isWaiting = false;
      }
    );
  }

  getIPPools() {
    const openstackConfig = new OpenstackConfig(this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2');

    this.cpm.getIPPools(
      openstackConfig
    ).subscribe(
      (data) => {
        this.ipPools = data;
        this.getNetworks();
      },
      (error) => {
        console.log(error);
        this.isWaiting = false;
      });
  private extractPropertyValue(propertyName: string): string {
    let match;
    let result: string = null;
    let pattern = new RegExp(propertyName + "=(.+)");

    // extract property
    if (this.cloudProvider.credential.rc_file) {
      if ((match = pattern.exec(this.cloudProvider.credential.rc_file)) !== null) {
        result = match[1].replace(/\"/g, "");
        console.log(propertyName + ":", result);
      }
    }
    return result;
  }
}
