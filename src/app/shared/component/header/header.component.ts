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
  private subdomain;

  constructor(private _eref: ElementRef,
              private _router: Router,
              private cloudCredentialsService: CloudProviderParametersService,
              private _applicationService: ApplicationService,
              public credentialService: CredentialService,
              public tokenService: TokenService,
              public errorService: ErrorService
  ) {


    if (isDevMode() || this.subdomain === 'portaldev') {
      this._logo = 'assets/img/logo/phenomenal_4x_dev.png';
    }
  }

  ngOnInit() {
    this.getSubdomain();
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

  getSubdomain() {
    const domain = window.location.hostname;
    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      this.subdomain = '';
    } else {
      this.subdomain = domain.split('.')[0];
    }
    console.log('subdomain', this.subdomain);
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
