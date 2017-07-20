import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CloudProvider} from '../cloud-provider';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import { matchingPasswords } from '../validator';
import {CloudProviderMetadataService} from '../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service';

@Component({
  selector: 'ph-ostack-setup',
  templateUrl: './ostack-setup.component.html',
  styleUrls: ['./ostack-setup.component.scss']
})
export class OstackSetupComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();
  form: FormGroup;
  isVerify: boolean;
  flavors;
  networks;
  ipPools;
  isWaiting = false;
  isUserDomainName = false;

  formErrors = {
    'username': '',
    'password': '',
    'confirmPassword': '',
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
    'confirmPassword': {
      'required': 'Please confirm your password.',
      'mismatchedPasswords': 'The password you entered does not match.'
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
    private cpm: CloudProviderMetadataService
  ) {


  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'confirmPassword': ['', [Validators.required]],
      'tenantName': ['', [Validators.required]],
      'authURL': ['', [Validators.required]],
      'flavor': ['', [Validators.required]],
      'network': ['', [Validators.required]],
      'ipPool': ['', [Validators.required]],
      'userDomainName': ['', [Validators.required]]
    }, {validator: matchingPasswords('password', 'confirmPassword')});

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  toggleVerify() {
    this.isWaiting = true;
    this.getIPPools();
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }
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

    if (form.getError('mismatchedPasswords')) {
      const messages = this.validationMessages['confirmPassword'];
      this.formErrors['confirmPassword'] += messages['mismatchedPasswords'] + ' ';
    }

    if (this.form.value['authURL'].substring(this.form.value['authURL'].length - 2, this.form.value['authURL'].length).toLocaleLowerCase() === 'v3') {
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

    console.log(this.cloudProvider);
    this.cloudProviderChange.emit(this.cloudProvider);
 }

  getFlavors() {
    this.cpm.getFlavors(
      this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2'
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
    this.cpm.getNetworks(
      this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2'
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
    this.cpm.getIPPools(
      this.form.value['username'],
      this.form.value['password'],
      this.form.value['tenantName'],
      this.form.value['userDomainName'],
      this.form.value['authURL'],
      this.isUserDomainName ? '3' : '2'
    ).subscribe(
      (data) => {
        this.ipPools = data;
        this.getNetworks();
      },
      (error) => {
        console.log(error);
        this.isWaiting = false;
      });
  }
}
