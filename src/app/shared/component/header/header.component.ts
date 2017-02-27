import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ApplicationService, CloudCredentialsService, CredentialService, ErrorService, TokenService} from 'ng2-cloud-portal-service-lib';

@Component({
  selector: 'ph-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  get logo(): string {
    return this._logo;
  }

  public isCollapsed = false;
  private _logo = 'assets/img/logo/phenomenal_4x.png';

  constructor(private _eref: ElementRef,
              private _router: Router,
              private cloudCredentialsService: CloudCredentialsService,
              private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public errorService: ErrorService
  ) {
  }

  ngOnInit() {
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeMenu() {
    this.isCollapsed = false;
  }

  logout() {
    this.credentialService.clearCredentials();
    this.tokenService.clearToken();
    this.isCollapsed = false;
    // location.reload();
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

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
}
