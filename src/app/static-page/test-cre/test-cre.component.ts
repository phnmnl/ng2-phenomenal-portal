import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from "../../setup/cloud-provider";
import { UserService } from "../../shared/service/user/user.service";
import { AppConfig } from "../../app.config";
import { User } from "../../shared/service/user/user";
import { Router } from "@angular/router";
import { ProviderRegistry } from "../../shared/service/deployer/provider-registry";

@Component({
  selector: 'ph-test-cre',
  templateUrl: './test-cre.component.html',
  styleUrls: ['./test-cre.component.css']
})
export class TestCreComponent implements OnInit {

  private user: User;

  private _publicProvider = ProviderRegistry.getPhenomenalProvider();

  constructor(public userService: UserService, private config: AppConfig, private router: Router) {
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

  get galaxy_instance_url(): string {
    return this.config.getConfig("galaxy_url") + "/user/login";
  }

  public get publicProvider(): CloudProvider {
    return this._publicProvider;
  }
}
