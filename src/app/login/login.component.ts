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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ph-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  /* Reference to the currently logged user */
  private _user: User;

  /* Link to external resource */
  public elixir_aai_logo = 'assets/img/logo/elixir_aai.png';
  public elixir_aai_link = 'https://www.elixir-europe.org/services/compute/aai';
  public elixir_czech_link = 'https://www.elixir-europe.org/about-us/who-we-are/nodes/czech-republic';
  public elixir_link = 'https://www.elixir-europe.org';
  public orcid_link = 'https://orcid.org';
  public google_link = 'https://www.google.it';
  public linkedin_link = 'https://www.linkedin.com';

  private returnUrl: string;

  constructor(private applicationService: ApplicationService,
              private authService: AuthService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public errorService: ErrorService,
              public userService: UserService,
              private route: ActivatedRoute,
              private router: Router) {
  }


  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
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
        if(this.returnUrl && this.returnUrl.length>0) {
          this.router.navigateByUrl(this.returnUrl);
          console.log("Navigating to URL " + this.returnUrl + " after login!");
        }else
          this.router.navigateByUrl('cloud-research-environment-setup');
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
