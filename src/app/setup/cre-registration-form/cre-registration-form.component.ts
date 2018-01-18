import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { GalaxyUser } from '../../shared/service/galaxy/galaxy-user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailValidator, matchingPasswords, passwordValidator } from '../validator';
import { UserService } from "../../shared/service/user/user.service";
import { AppConfig } from "../../app.config";


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
  passwordConfirm = "";
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
              private appConfig: AppConfig,
              private userService: UserService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  get galaxyInstanceUrl() {
    return this.appConfig.getConfig("galaxy_url") + "/user/login";
  }

  buildForm(): void {

    this.form = this.fb.group({
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

  registerGalaxyAccount(username: string, email: string, password: string) {

    let currentUser = this.userService.getCurrentUser();
    const newUsername = email.replace(/\W+/g, '-').toLowerCase();
    const user: GalaxyUser = {username: newUsername, password: password, email: email};

    try {
      this.userService.createGalaxyAccount(currentUser.id, user).subscribe(
        data => {
          console.log(data);

          if (data===null) {
            console.warn("Server response is empty");
            return this.processGalaxyAccountRegistrationFailure("No server response !!!");
          }

          this._isFailed = false;
          this._isSuccess = true;
          currentUser.hasGalaxyAccount = true;
          return false;
        },
        error => {
          let error_info = JSON.parse(error._body);
          console.log("The error object", error_info);
          if (error_info.code === 409) {
            // Consider registration OK even if the user has an existent account with that email:
            // in such a case an error message is shown
            this._isFailed = false;
            this._isSuccess = true;
          } else {
            this._isFailed = true;
            this._isSuccess = false;
          }
          this._message = error_info.message;
          return false;
        }
      );
    } catch (error) {
      this.processGalaxyAccountRegistrationFailure(error);
    }
  }

  private processGalaxyAccountRegistrationFailure(error){
    this._isFailed = true;
    this._isSuccess = false;
    this._message = error ? error.toString() : "Internal Server Error";
    return false;
  }

  onSubmit() {
    if (this.cloudProvider.name === 'phenomenal') {
      this.registerGalaxyAccount('', this.form.value['email'], this.form.value['password']);
    } else {
      this.cloudProvider.credential.galaxy_admin_email = this.form.value['email'];
      this.cloudProvider.credential.galaxy_admin_password = this.form.value['password'];
      this.cloudProvider.isSelected = 3;
      this._isSuccess = true;
    }
  }

}
