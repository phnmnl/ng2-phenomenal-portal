import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApplicationService,
  AuthService,
  CredentialService
} from 'ng2-cloud-portal-service-lib';
import { UserService } from '../shared/service/user/user.service';
import { User } from '../shared/service/user/user';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

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
  private previousUrl: string;
  private returnUrl: string;

  constructor(private applicationService: ApplicationService,
              private authService: AuthService,
              public credentialService: CredentialService,
              public userService: UserService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
    this._user = this.userService.getCurrentUser();
    if (this._user) {
      this.isAuthorized();
    } else {
      this.userService.getObservableCurrentUser().subscribe(user => {
        this.isAuthorized();
      });
    }
    this.router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
        if (event.url !== '/login')
          this.previousUrl = event.url;
      });
  }

  ngOnDestroy() {
  }

  private isAuthorized() {
    this.userService.isUserAuthorized().subscribe(
      (user) => {
        this._user = user;
        if (user.hasAcceptedTermConditions) {
          console.log("Already in terms & conditions");
          if (!this.returnUrl || this.returnUrl.length <= 0) {
            this.returnUrl = this.previousUrl ? this.previousUrl : '/home';
          }
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigateByUrl('term-and-condition');
        }
      },
      (user) => {
        console.log("User not authenticated!!!");
      });
  }

  public existsUser() {
    return this.userService.isUserInSession();
  }

  get user(): User {
    return this._user;
  }

  ssoLink() {
    console.log("SSO link: " + this.authService.ssoLink());
    return this.authService.ssoLink() + '&ttl=2400';
  }
}
