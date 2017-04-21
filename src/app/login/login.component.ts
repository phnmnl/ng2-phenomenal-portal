import {Component, OnInit, Renderer, OnDestroy} from '@angular/core';
import {ApplicationService, AuthService, CredentialService, ErrorService, JwtToken, TokenService} from 'ng2-cloud-portal-service-lib';
import {UserService} from '../shared/service/user/user.service';
import {User} from '../shared/service/user/user';
import {PhenomenalTokenService} from '../shared/service/phenomenal-token/phenomenal-token.service';
import {Router} from '@angular/router';

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
    public renderer: Renderer,
    private router: Router
  ) {
    // We cache the function "listenGlobal" returns, as it's one that allows to cleanly unregister the event listener
    this.removeMessageListener = this.renderer.listenGlobal('window', 'message', (event: MessageEvent) => {
      if (this._authService.canAcceptMessage(event)) {
        this.saveToken(event.data, () => {
        });
        event.source.close();
      }
    });

    if (this.tokenService.getToken()) {
      this.getAllApplication();
    }

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

  // authenticate() {
  //   this.userService.authenticate().subscribe(
  //     (data) => {
  //       const theToken: JwtToken = <JwtToken>{ token: data['id_token'] };
  //       this.phTokenService.setToken(theToken);
  //       this.checkUser();
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }
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

  // activate() {
  //   this._user.isReadTC = true;
  //   this.userService.edit(this._user, this.phTokenService.getToken().token).subscribe(
  //     (data) => {
  //       console.log(data);
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

  private saveToken(jwt: string, callback) {
    const theToken: JwtToken = <JwtToken>{ token: jwt };
    this.tokenService.setToken(theToken);
    const tokenClaims = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(jwt.split('.')[1]));
    this.credentialService.setCredentials(tokenClaims.sub, null, tokenClaims.name);
  }


  ngOnInit() {

  }

  ssoLink() {
    return this._authService.ssoLink();
  }

  // private checkUser() {
  //
  //   const temp = {id: this.credentialService.getUsername(), isReadTC: false, isRegisterGalaxy: false};
  //   this.userService.get(temp, this.phTokenService.getToken().token).subscribe(
  //     (res) => {
  //       console.log(res);
  //       this._user.id = res['id'];
  //       this._user.isReadTC = res['isReadTC'];
  //       this._user.isRegisterGalaxy = res['isRegisterGalaxy'];
  //     },
  //     (err) => {
  //       console.log(err);
  //       if (err.status === 404) {
  //         console.log('not found');
  //         this.userService.add(this._user, this.phTokenService.getToken().token).subscribe(
  //           (ret) => {
  //             console.log(ret);
  //           },
  //           (error) => {
  //             console.log(error);
  //           }
  //         );
  //       }
  //     }
  //   );
  // }

  getAllApplication() {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      deployment  => {
        // console.log('[RepositoryComponent] getAll %O', deployment);
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
