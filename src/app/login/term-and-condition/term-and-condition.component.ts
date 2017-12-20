import { Component, OnInit } from '@angular/core';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { UserService } from '../../shared/service/user/user.service';
import { Router } from '@angular/router';
import { User } from "../../shared/service/user/user";

@Component({
  selector: 'ph-term-and-condition',
  templateUrl: './term-and-condition.component.html',
  styleUrls: ['./term-and-condition.component.scss']
})
export class TermAndConditionComponent implements OnInit {

  currentUser: User;
  checked1 = false;
  checked2 = false;
  checked3 = false;

  constructor(public credentialService: CredentialService,
              public userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.currentUserObservable.subscribe(user => {
      console.log("Updated user", user);
      this.currentUser = <User> user;
      if (this.currentUser && this.currentUser.hasAcceptedTermConditions) {
        this.router.navigateByUrl('cloud-research-environment');
      } else {
        console.log("Already in terms & conditions");
      }
    });
  }


  acceptTermCondition() {
    this.userService.add(this.credentialService.getUsername()).subscribe(
      (res) => {
        console.log(res);
        this.router.navigateByUrl('cloud-research-environment');
      }
    );
  }

}
