import {Component, OnInit, Renderer, OnDestroy} from '@angular/core';
import {AuthService, CredentialService, JwtToken, TokenService} from 'ng2-cloud-portal-service-lib';


@Component({
  selector: 'ph-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit, OnDestroy {
  get logo_white(): string {
    return this._logo_white;
  }
  get elixir_logo(): string {
    return this._elixir_logo;
  }

  private _elixir_logo = 'assets/img/logo/elixir.png';
  private _logo_white = 'assets/img/logo/phenomenal_white_4x.png';
  removeMessageListener: Function;

  constructor(
    private _authService: AuthService,
    public credentialService: CredentialService,
    public tokenService: TokenService,
    renderer: Renderer
  ) {
    // We cache the function "listenGlobal" returns, as it's one that allows to cleanly unregister the event listener
    this.removeMessageListener = renderer.listenGlobal('window', 'message', (event: MessageEvent) => {
      if (this._authService.canAcceptMessage(event)) {
        this.saveToken(event.data);
        event.source.close();
        console.log('Got Token');
        // console.warn('received unacceptable message! Ignoring...', event);
        // return;
      }
    });
  }

  private saveToken(jwt: string) {
    console.log('[LoginPage] Obtained token from saml %O', jwt);
    let theToken: JwtToken = <JwtToken>{ token: jwt };
    this.tokenService.setToken(theToken);
    let tokenClaims = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(jwt.split('.')[1]));
    this.credentialService.setCredentials(tokenClaims.sub, null);
  }


  ngOnInit() {
  }

  ssoLink() {
    return this._authService.ssoLink();
  }

  ngOnDestroy() {
    this.removeMessageListener();
  }
}
