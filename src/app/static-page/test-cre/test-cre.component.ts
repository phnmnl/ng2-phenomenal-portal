import { Component, OnInit } from '@angular/core';
import { CloudProvider } from "../../setup/cloud-provider";
import { UserService } from "../../shared/service/user/user.service";
import { AppConfig } from "../../app.config";
import { User } from "../../shared/service/user/user";
import { Router } from "@angular/router";

@Component({
  selector: 'ph-test-cre',
  templateUrl: './test-cre.component.html',
  styleUrls: ['./test-cre.component.css']
})
export class TestCreComponent implements OnInit {

  private user: User;

  private _publicProvider = {
    title: 'PhenoMeNal Cloud',
    name: 'phenomenal',
    help: '/help/Deployment-Cloud-Research-Environment',
    description: 'Note that this is a public instance accessible by everyone. Your data will be stored on the PhenoMeNal Cloud with computing power by PhenoMeNal partners. ' +
    'This is not suitable for sensitive or private data. Uploaded data will be kept for a limited amount of time only.',
    paymentDescription: 'Free',
    providerDescription: 'EMBL-EBI, Uppsala Uni',
    locationDescription: 'Europe',
    logo: 'assets/img/logo/default_app.png',
    isSelected: 0,
    credential: {
      username: '',
      password: '',
      tenant_name: '',
      url: '',
      provider: '',
      galaxy_admin_username: '',
      galaxy_admin_email: '',
      galaxy_admin_password: '',
      jupyter_password: ''
    }
  };

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
