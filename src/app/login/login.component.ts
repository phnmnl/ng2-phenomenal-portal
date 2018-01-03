import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApplicationService,
  AuthService,
  CredentialService,
  ErrorService,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { UserService } from '../shared/service/user/user.service';
import { User } from '../shared/service/user/user';
import { Router } from '@angular/router';

@Component({
  selector: 'ph-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  private _user: User;

  private _elixir_logo = 'assets/img/logo/elixir.png';


  constructor(private applicationService: ApplicationService,
              private authService: AuthService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public errorService: ErrorService,
              public userService: UserService,
              private router: Router) {
  }


  ngOnInit() {
    this._user = this.userService.getCurrentUser();
    if (this._user)
      this.isAuthorized(this._user);
    else
      this.userService.getObservableCurrentUser().subscribe(user => {
        console.log("Updated user", user);
        this.isAuthorized(user);
        this._user = <User> user;
      });
  }

  private isAuthorized(user: User) {
    if (user) {
      if (user.hasAcceptedTermConditions) {
        console.log("Already in terms & conditions");
        this.router.navigateByUrl('cloud-research-environment/setup');
      } else {
        this.router.navigateByUrl('term-and-condition');
      }
    }
  }


  public existsUser() {
    return this.userService.isUserAuthenticated();
  }

  get user(): User {
    return this._user;
  }

  get elixir_logo(): string {
    return this._elixir_logo;
  }

  ssoLink() {
    console.log("SSO link: " + this.authService.ssoLink());
    return this.authService.ssoLink();
  }

  getAllApplication() {
    this.applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      deployment => {
        console.log('[RepositoryComponent] getAll %O', deployment);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        this.errorService.setCurrentError(error);
        this.tokenService.clearToken();
        this.credentialService.clearCredentials();
      }
    );
  }

  ngOnDestroy() {
  }
}
