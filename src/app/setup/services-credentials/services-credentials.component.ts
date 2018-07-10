import { Component, Input, OnInit } from '@angular/core';
import { User } from "../../shared/service/user/user";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Deployment } from "../../shared/service/deployer/deployment";
import { matchingPasswords, passwordValidator } from "../validator";
import { CloudProvider } from "../../shared/service/deployer/cloud-provider";
import { AppConfig } from "../../app.config";
import { DeployementService } from "../../shared/service/deployer/deployement.service";
import { GalaxyUser } from "../../shared/service/galaxy/galaxy-user";
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
  private _isFailed = false;
  _isSuccess = false;
  private _message = '';
  public currentUser: User;
  passwordConfirm = '';
  form: FormGroup;
  errors = [];

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
        console.log("Updated user @ CloudSetupEnvironment", user, this.currentUser)
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

  registerGalaxyAccount(username: string, email: string, password: string) {

    const newUsername = email.replace(/\W+/g, '-').toLowerCase();
    const user: GalaxyUser = {username: newUsername, password: password, email: email};
    try {
      this.registering = true;
      this.userService.createGalaxyAccount(this.currentUser.id, user).subscribe(
        data => {
          console.log("User data registered", data);
          if (!data) {
            console.warn("Server response is empty");
            this.registering = false;
            return this.processGalaxyAccountRegistrationFailure("No server response !!!");
          }
          this._isFailed = false;
          this._isSuccess = true;
          this.currentUser.hasGalaxyAccount = true;
          this.registering = false;
          return false;
        },
        error => {
          console.log(error);
          if (error._body !== 'null') {
            let error_info = JSON.parse(error._body);
            console.log("The error object", error_info);
            this._message = error_info.message;
            if (error_info.code === 409) {
              // Consider registration OK even if the user has an existent account with that email:
              // in such a case an error message is shown
              this._isFailed = false;
              this._isSuccess = true;
            }
          } else {
            this._message = "No server response !!!";
            this._isFailed = true;
            this._isSuccess = false;
          }
          this.registering = false;
          return false;
        }
      );
    } catch (error) {
      this.processGalaxyAccountRegistrationFailure(error);
    }
  }

  private processGalaxyAccountRegistrationFailure(error) {
    this._isFailed = true;
    this._isSuccess = false;
    this._message = error ? error.toString() : "Internal Server Error";
    return false;
  }

  onSubmit() {
    if (this.cloudProvider.name === 'phenomenal') {
      this.registerGalaxyAccount(this.currentUser.email, this.currentUser.email, this.form.value['password']);
    } else {
      if (this.cloudProvider.isSelected === 2) {
        this.cloudProvider.credential.galaxy_admin_email = this.currentUser.email;
        this.cloudProvider.credential.galaxy_admin_password = this.form.value['password'];
        this.cloudProvider.isSelected = 3;
        this._isSuccess = true;
      } else {
        this.cloudProvider.credential.username = this.credentialsService.getUsername();
        let deployment = Deployment.buildFromConfigurationParameters(this.appConfig, this.cloudProvider.credential);
        this.deployementService.deploy(deployment);
        this.router.navigateByUrl('/cloud-research-environment-dashboard');
      }
    }
  }

  onKeyPressed(event) {
    if (event.keyCode == 13) {
      if (this.form.valid)
        this.onSubmit();
      return false;
    }
  }

}
