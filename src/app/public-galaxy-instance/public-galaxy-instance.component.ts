import { AppConfig } from "../app.config";
import { Router } from "@angular/router";
import { User } from "../shared/service/user/user";
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from "../shared/service/user/user.service";
import { CloudProvider } from "../shared/service/deployer/cloud-provider";
import { ProviderRegistry } from "../shared/service/deployer/provider-registry";
import { ProviderSelectorComponent } from "../setup/provider-selector/provider-selector.component";
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
  private user: User;
  private _publicProvider = ProviderRegistry.getPhenomenalProvider();

  // UI control
  showRegistrationForm: boolean = false;
  @Input() previousRoute: string = "";

  constructor(public userService: UserService,
              private config: AppConfig,
              private router: Router,
              private cdRef: ChangeDetectorRef,) {
    this.user = this.userService.getCurrentUser();
    console.log("Current user: ", this.user);
  }

  ngOnInit() {
    this.userService.getObservableCurrentUser().subscribe(user => {
      this.user = <User> user;
      if (user) {
        console.log("*** Has Galaxy account: " + this.user.hasGalaxyAccount);
      }
      console.log("Updated user @ CloudSetupComponent", user, this.user)
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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
