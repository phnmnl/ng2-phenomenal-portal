import { Component, OnDestroy, OnInit, Renderer } from '@angular/core';
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
  // get logo_white(): string {
  //   return this._logo_white;
  // }

  private _elixir_logo = 'assets/img/logo/elixir.png';
  // private _logo_white = 'assets/img/logo/phenomenal_white_4x.png';
  removeMessageListener: Function;
  // private checked1 = false;
  // private checked2 = false;
  // private checked3 = false;
  private _user: User;

  get user(): User {
    return this._user;
  }

  get elixir_logo(): string {
    return this._elixir_logo;
  }

  constructor(private applicationService: ApplicationService,
              private authService: AuthService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              // public phTokenService: PhenomenalTokenService,
              public errorService: ErrorService,
              public userService: UserService,
              public renderer: Renderer,
              private router: Router) {


    this.removeMessageListener = renderer.listenGlobal('window', 'message', (event: MessageEvent) => {
      if (!this.authService.canAcceptMessage(event)) {
        console.log('received unacceptable message! Ignoring...', event);
        return;
      }
      this.authService.processToken(event.data);
      event.source.close();
      if (tokenService.getToken()) {
        this.getAllApplication();
      }
    });
  }

  next() {
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

  // private saveToken(jwt: string, callback) {
  //   const theToken: JwtToken = <JwtToken>{token: jwt};
  //   this.tokenService.setToken(theToken);
  //   const tokenClaims = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(jwt.split('.')[1]));
  //   // this.credentialService.setCredentials(tokenClaims.sub, null, tokenClaims.name);
  //   // this.credentialService.setCredentials();
  //
  // }


  ngOnInit() {

  }

  ssoLink() {
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
    this.removeMessageListener();
  }
}
