import {Component, OnInit, Renderer, OnDestroy} from '@angular/core';
import {ApplicationService, AuthService, CredentialService, ErrorService, JwtToken, TokenService} from 'ng2-cloud-portal-service-lib';
import {UserService} from '../shared/service/user/user.service';
import {User} from '../shared/service/user/user';
import {PhenomenalTokenService} from '../shared/service/phenomenal-token/phenomenal-token.service';

@Component({
  selector: 'ph-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  get logo_white(): string {
    return this._logo_white;
  }
  get elixir_logo(): string {
    return this._elixir_logo;
  }

  private _elixir_logo = 'assets/img/logo/elixir.png';
  private _logo_white = 'assets/img/logo/phenomenal_white_4x.png';
  removeMessageListener: Function;
  private checked1 = false;
  private checked2 = false;
  private checked3 = false;
  private _user: User;

  get user(): User {
    return this._user;
  }

  constructor(
    private _applicationService: ApplicationService,
    private _authService: AuthService,
    public credentialService: CredentialService,
    public tokenService: TokenService,
    public phTokenService: PhenomenalTokenService,
    public errorService: ErrorService,
    public userService: UserService,
    public renderer: Renderer
  ) {
    // We cache the function "listenGlobal" returns, as it's one that allows to cleanly unregister the event listener
    this.removeMessageListener = this.renderer.listenGlobal('window', 'message', (event: MessageEvent) => {
      if (this._authService.canAcceptMessage(event)) {
        this.saveToken(event.data, () => {
          // this.userService.authenticate().subscribe(
          //   (data) => {
          //     const theToken: JwtToken = <JwtToken>{ token: data['id_token'] };
          //     this.phTokenService.setToken(theToken);
          //
          //     this.checkUser();
          //   },
          //   (error) => {
          //     console.log(error);
          //   }
          // );
        });
        event.source.close();
        console.log('Got Token');

      }
    });

    if (this.tokenService.getToken()) {
      this.getAllApplication();
      // this.checkUser();
    }

    // console.log('user ' + this.user.id);
    // console.log('cred ' + this.credentialService.getUsername());
    // console.log('token ' + this.tokenService.getToken());
  }

  // getActivate() {
  //
  //   if (this.user === null) {
  //     const temp = {id: this.credentialService.getUsername(), isActivate: false, isRegister: false};
  //     this.userService.get(temp, this.phTokenService.getToken().token).subscribe(
  //       (res) => {
  //         console.log(res);
  //         this._user.id = res['id'];
  //         this._user.isActivate = res['isActivate'];
  //         this._user.isRegister = res['isRegister'];
  //       },
  //       (err) => {
  //         console.log(err);
  //         if (err.status === 404) {
  //           this.userService.add(this._user, this.phTokenService.getToken().token).subscribe(
  //             (ret) => {
  //               console.log(ret);
  //             },
  //             (error) => {
  //               console.log(error);
  //             }
  //           );
  //         }
  //       }
  //     );
  //   }
  //
  //   return this.user.isActivate;
  // }

  activate() {
    this._user.isActivate = true;
    this.userService.edit(this._user, this.phTokenService.getToken().token).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  private saveToken(jwt: string, callback) {
    console.log('[LoginPage] Obtained token from saml %O', jwt);
    const theToken: JwtToken = <JwtToken>{ token: jwt };
    this.tokenService.setToken(theToken);
    const tokenClaims = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(jwt.split('.')[1]));
    this.credentialService.setCredentials(tokenClaims.sub, null);
  }


  ngOnInit() {

  }

  ssoLink() {
    return this._authService.ssoLink();
  }

  private checkUser() {

    const temp = {id: this.credentialService.getUsername(), isActivate: false, isRegister: false};
    this.userService.get(temp, this.phTokenService.getToken().token).subscribe(
      (res) => {
        console.log(res);
        this._user.id = res['id'];
        this._user.isActivate = res['isActivate'];
        this._user.isRegister = res['isRegister'];
      },
      (err) => {
        console.log(err);
        if (err.status === 404) {
          this.userService.add(this._user, this.phTokenService.getToken().token).subscribe(
            (ret) => {
              console.log(ret);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      }
    );
  }

  getAllApplication() {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      deployment  => {
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
