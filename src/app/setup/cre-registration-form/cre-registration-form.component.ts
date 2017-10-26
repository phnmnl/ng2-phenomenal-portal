import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { GalaxyUser } from '../../shared/service/galaxy/galaxy-user';
import { GalaxyService } from '../../shared/service/galaxy/galaxy.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailValidator, matchingPasswords, passwordValidator } from '../validator';
import { CredentialService } from 'ng2-cloud-portal-service-lib';


@Component({
  selector: 'ph-cre-registration-form',
  templateUrl: './cre-registration-form.component.html',
  styleUrls: ['./cre-registration-form.component.scss']
})
export class CreRegistrationFormComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;
  private _isFailed = false;
  _isSuccess = false;
  private _message = '';
  form: FormGroup;

  formErrors = {
    'email': '',
    'password': '',
    'confirmPassword': ''
  };

  validationMessages = {
    'email': {
      'required': 'Your email is required.',
      'invalidEmail': 'Your email is invalid.'
    },
    'password': {
      'required': 'Password is required.',
      'minlength': 'Password must be at least 8 characters long.',
      'invalidPassword': 'Your Password must contain numbers and letters.'
    },
    'confirmPassword': {
      'required': 'Please confirm your password.',
      'mismatchedPasswords': 'The password you entered does not match.'
    }
  };

  get message(): string {
    return this._message;
  }

  constructor(private fb: FormBuilder,
              public galaxyService: GalaxyService,
              private credentialService: CredentialService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', [Validators.required, Validators.minLength(8), passwordValidator]],
      'confirmPassword': ['', [Validators.required]]
    }, {validator: matchingPasswords('password', 'confirmPassword')});

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
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

    if (form.getError('mismatchedPasswords')) {
      const messages = this.validationMessages['confirmPassword'];
      this.formErrors['confirmPassword'] += messages['mismatchedPasswords'] + ' ';
    }
  }

  registerGalaxyAccount(email: string, password: string) {

    const newUsername = email.replace(/\W+/g, '-').toLowerCase();
    const user: GalaxyUser = {
      username: newUsername,
      password: password,
      email: email,
      token: this.credentialService.getUsername()
    };
    this.galaxyService.createUser(user).subscribe(
      data => {
        console.log(data);

        if (!data['err_code']) {
          this._isFailed = false;
          this._isSuccess = true;
        } else {
          this._isFailed = true;
          this._isSuccess = false;
        }

      },
      error => {
        console.log(error);
        this._isFailed = true;
        this._isSuccess = false;
        this._message = error.json().err_msg;
      }
    );
  }

  onSubmit() {
    if (this.cloudProvider.name === 'phenomenal') {
      this.registerGalaxyAccount(this.form.value['email'], this.form.value['password']);
    } else {
      this.cloudProvider.credential.galaxy_admin_email = this.form.value['email'];
      this.cloudProvider.credential.galaxy_admin_password = this.form.value['password'];
      this._isSuccess = true;
    }
  }

}
