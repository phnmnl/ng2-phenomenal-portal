import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { UserService } from "../../shared/service/user/user.service";
import { User } from "../../shared/service/user/user";
import { AppConfig } from "../../app.config";

@Component({
  selector: 'ph-cloud-setup',
  templateUrl: './cloud-setup.component.html',
  styleUrls: ['./cloud-setup.component.scss']
})

export class CloudSetupComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;

  private user: User;

  constructor(public userService: UserService, private config: AppConfig) {
    this.user = this.userService.getCurrentUser();
    console.log("Current user: ", this.user);
  }

  ngOnInit() {
    this.userService.getObservableCurrentUser().subscribe(user => {
      this.user = <User> user;
      if(user) {
        console.log("*** Has Galaxy account: " + this.user.hasGalaxyAccount);
      }
      console.log("Updated user @ CloudSetupComponent", user, this.user)
    });
    console.log("Cloud provider user", this.user);
  }


  get galaxy_instance_url(): string {
    console.debug("Galaxy instance URL:", this.config.getConfig("galaxy_url"));
    return this.config.getConfig("galaxy_url") + "/user/login";
  }
}
