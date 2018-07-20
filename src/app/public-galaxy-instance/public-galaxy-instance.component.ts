import { AppConfig } from "../app.config";
import { Router } from "@angular/router";
import { User } from "../shared/service/user/user";
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from "../shared/service/user/user.service";
import { CloudProvider } from "../shared/service/deployer/cloud-provider";
import { GalaxyPublicInstanceRegistrationComponent } from "./galaxy-public-instance-registration/galaxy-public-instance-registration.component";
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'ph-public-galaxy-instance',
  templateUrl: './public-galaxy-instance.component.html',
  styleUrls: ['./public-galaxy-instance.component.scss']
})
export class PublicGalaxyInstanceComponent implements OnInit {

  // reference to the child component
  @ViewChild(GalaxyPublicInstanceRegistrationComponent) registrationComponent: GalaxyPublicInstanceRegistrationComponent;

  // UI Data
  private _user: User;
  private _publicProvider = ProviderRegistry.getPhenomenalProvider();

  // UI control
  @Input() previousRoute: string = "";

  constructor(public userService: UserService,
              private config: AppConfig,
              private router: Router,
              private cdRef: ChangeDetectorRef,) {
    this._user = this.userService.getCurrentUser();
    console.log("Current user: ", this._user);
  }

  ngOnInit() {
    this.userService.getObservableCurrentUser().subscribe(user => {
      this._user = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this._user.hasGalaxyAccount);
      }
      console.log("Updated user @ CloudSetupComponent", user, this._user)
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }


  get user(): User {
    return this._user;
  }

  get form(): FormGroup {
    return this.registrationComponent ? this.registrationComponent.form : null;
  }

  get galaxy_instance_url(): string {
    return this.config.getConfig("galaxy_url") + "/user/login";
  }

  public get publicProvider(): CloudProvider {
    return this._publicProvider;
  }

  public registerGalaxyAccount() {
    this.registrationComponent.onSubmit();
  }
}
