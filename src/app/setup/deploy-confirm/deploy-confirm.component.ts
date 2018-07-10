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
  selector: 'ph-deploy-confirm',
  templateUrl: './deploy-confirm.component.html',
  styleUrls: ['./deploy-confirm.component.scss']
})
export class DeployConfirmComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  private _isFailed = false;
  _isSuccess = false;
  private _message = '';
  public currentUser: User;
  form: FormGroup;
  errors = [];
  registering: boolean = false;


  constructor(private fb: FormBuilder,
              private appConfig: AppConfig,
              private router: Router,
              private userService: UserService) {
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

  buildForm(): void {
    this.form = this.fb.group({});
    this.currentUser = this.userService.getCurrentUser();
  }

  get message(): string {
    return this._message;
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
    console.log("Submitting");
  }

  onKeyPressed(event) {
    if (event.keyCode == 13) {
      if (this.form.valid)
        this.onSubmit();
      return false;
    }
  }
}
