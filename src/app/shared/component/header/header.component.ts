import { Component, ElementRef, HostListener, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialService, TokenService } from 'ng2-cloud-portal-service-lib';

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
              public credentialService: CredentialService,
              public tokenService: TokenService,) {
    this.getSubdomain();
  }

  ngOnInit() {
    if (isDevMode() || this.subdomain === 'portaldev') {
      this._logo = 'assets/img/logo/phenomenal_4x_dev.png';
    }
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
  }

}
