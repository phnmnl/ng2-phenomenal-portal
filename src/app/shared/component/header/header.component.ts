import { Component, ElementRef, HostListener, isDevMode, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ApplicationService, CloudProviderParametersService, CredentialService, ErrorService, TokenService} from 'ng2-cloud-portal-service-lib';

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
              private cloudCredentialsService: CloudProviderParametersService,
              private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public errorService: ErrorService
  ) {
    if (isDevMode()) {
      this._logo = 'assets/img/logo/phenomenal_4x_dev.png';
    }
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
    this._router.navigateByUrl('/home');
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
