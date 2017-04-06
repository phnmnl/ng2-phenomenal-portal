import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CloudProvider} from '../cloud-provider';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import { matchingPasswords } from '../validator';

@Component({
  selector: 'ph-ostack-setup',
  templateUrl: './ostack-setup.component.html',
  styleUrls: ['./ostack-setup.component.scss']
})
export class OstackSetupComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();
  form: FormGroup;

  formErrors = {
    'username': '',
    'password': '',
    'confirmPassword': '',
    'tenantName': '',
    'authURL': ''
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
    }
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'confirmPassword': ['', [Validators.required]],
      'tenantName': ['', [Validators.required]],
      'authURL': ['', [Validators.required]]
    }, {validator: matchingPasswords('password', 'confirmPassword')});

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
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
  }

  onSubmit() {
    this.cloudProvider.isSelected = 2;
    this.cloudProvider.credential.username = this.form.value['username'];
    this.cloudProvider.credential.password = this.form.value['password'];
    this.cloudProvider.credential.tenant_name = this.form.value['tenantName'];
    this.cloudProvider.credential.url = this.form.value['authURL'];

    this.cloudProviderChange.emit(this.cloudProvider);
 }
}
