import { Component, Input, OnInit } from '@angular/core';
import { User } from "../../shared/service/user/user";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { matchingPasswords, passwordValidator } from "../validator";
import { CloudProvider } from "../../shared/service/deployer/cloud-provider";
import { AppConfig } from "../../app.config";
import { DeployementService } from "../../shared/service/deployer/deployement.service";
import { CredentialService } from "ng2-cloud-portal-service-lib";
import { UserService } from "../../shared/service/user/user.service";
import { Router } from "@angular/router";

@Component({
  selector: 'ph-services-credentials',
  templateUrl: './services-credentials.component.html',
  styleUrls: ['./services-credentials.component.scss']
})
export class ServicesCredentialsComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  private _message = '';
  public currentUser: User;
  passwordConfirm = '';
  form: FormGroup;
  errors = [];
  _isSuccess = false;

  registering: boolean = false;
  hidePassword: boolean = true;
  hidePasswordConfirm: boolean = true;

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
              private router: Router,
              private userService: UserService,
              private credentialsService: CredentialService,
              private deployementService: DeployementService) {
  }

  ngOnInit() {
    this.buildForm();
    this.userService.getObservableCurrentUser().subscribe(user => {
      console.log("Updating the current user", user);
      this.currentUser = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this.currentUser.hasGalaxyAccount);
        console.log("Updated user @ CloudSetupEnvironment", user, this.currentUser);
        // set the email of the Galaxy user
        this.cloudProvider.credential.galaxy_admin_email = this.userService.getCurrentUser().email;
      }
    });
  }

  get galaxyInstanceUrl() {
    return this.appConfig.getConfig("galaxy_url") + "/user/login";
  }

  buildForm(): void {

    this.form = this.fb.group({
      'password': ['', [Validators.required, Validators.minLength(8), passwordValidator]],
      'confirmPassword': ['', [Validators.required]]
    }, {validator: matchingPasswords('password', 'confirmPassword')});

    this.currentUser = this.userService.getCurrentUser();
    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;

    // clean errors
    this.errors.splice(0, this.errors.length);

    for (const field of Object.keys(this.formErrors)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
          this.errors.push(messages[key] + ' ');
        }
      }
    }

    if (form.getError('mismatchedPasswords')) {
      const messages = this.validationMessages['confirmPassword'];
      this.formErrors['confirmPassword'] += messages['mismatchedPasswords'] + ' ';
      this.errors.push(messages['mismatchedPasswords'] + ' ');
    }
  }

  onSubmit() {
  }

  onKeyPressed(event) {
    if (event.keyCode == 13) {
      if (this.form.valid)
        this.onSubmit();
      return false;
    }
  }

}
