import { Component, OnInit } from '@angular/core';
import { CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';
import { UserService } from '../../shared/service/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ph-term-and-condition',
  templateUrl: './term-and-condition.component.html',
  styleUrls: ['./term-and-condition.component.scss']
})
export class TermAndConditionComponent implements OnInit {

  checked1 = false;
  checked2 = false;
  checked3 = false;

  constructor(
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.isUserExist(this.credentialService.getUsername());
  }


  private isUserExist(id: string) {

    this.userService.get(id).subscribe(
      (res) => {
        if (res['data']) {
          this.router.navigateByUrl('cloud-research-environment');
        }
        if (res['error']) {
          this.router.navigateByUrl('term-and-condition');
        }
      },
      (err) => {
        console.log(err);
      }
    );
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
