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

  checked1 = false;
  checked2 = false;
  checked3 = false;
  currentUser: User;

  constructor(public credentialService: CredentialService,
              public userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.getObservableCurrentUser().subscribe(user => {
      console.log("Updated user", this, user);
      this.currentUser = <User> user;
    });
  }

  acceptTermCondition() {
    this.userService.add(this.credentialService.getUsername()).subscribe(
      (res) => {
        console.log(res);
        this.router.navigateByUrl('cloud-research-environment');
      },
      (err) => {
        console.error(err);
      }
    );
  }

}
