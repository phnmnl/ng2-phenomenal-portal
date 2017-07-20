import {Component, OnInit, Renderer, OnDestroy} from '@angular/core';
import {ApplicationService, AuthService, CredentialService, ErrorService, JwtToken, TokenService} from 'ng2-cloud-portal-service-lib';
import {UserService} from '../../shared/service/user/user.service';
import {User} from '../../shared/service/user/user';
import {PhenomenalTokenService} from '../../shared/service/phenomenal-token/phenomenal-token.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ph-term-and-condition',
  templateUrl: './term-and-condition.component.html',
  styleUrls: ['./term-and-condition.component.scss']
})
export class TermAndConditionComponent implements OnInit {

  private checked1 = false;
  private checked2 = false;
  private checked3 = false;

  constructor(
    private _applicationService: ApplicationService,
    private _authService: AuthService,
    public credentialService: CredentialService,
    public tokenService: TokenService,
    public phTokenService: PhenomenalTokenService,
    public errorService: ErrorService,
    public userService: UserService,
    public renderer: Renderer,
    private router: Router
  ) { }

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
