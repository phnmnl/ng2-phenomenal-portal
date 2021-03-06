import { Component, ElementRef, HostListener, isDevMode, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from "../../service/user/user.service";
import { User } from "../../service/user/user";

@Component({
  selector: 'ph-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private subDomain;
  private removeMessageListener;
  private lastChoice = true;

  // template properties
  currentUser: User;
  isCollapsed = false;
  private _logo = 'assets/img/logo/phenomenal_4x.png';

  constructor(private _eref: ElementRef,
              private router: Router,
              private renderer: Renderer2,
              private userService: UserService) {
    this.getSubdomain();
  }

  ngOnInit() {
    if (isDevMode() || this.subDomain === 'portaldev') {
      this._logo = 'assets/img/logo/phenomenal_4x_dev.png';
    }

    this.userService.getObservableCurrentUser().subscribe(user => {
      console.log("Updated user @ ", user);
      this.currentUser = <User> user;
    });
    this.removeMessageListener = this.userService.registerTokenListener(this.renderer);
  }

  ngOnDestroy() {
    if (this.removeMessageListener)
      this.removeMessageListener();
  }

  get logo(): string {
    return this._logo;
  }

  public createNewCre() {
    this.lastChoice = !this.lastChoice;
    this.router.navigate(['cloud-research-environment-setup'], {queryParams: {'state': this.lastChoice}});
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  isActiveCREMenu() {
    return this.router.url.includes("cloud-research-environment");
  }

  closeMenu() {
    this.isCollapsed = false;
  }

  logout() {
    this.userService.logout();
    this.isCollapsed = false;
    this.router.navigateByUrl('/home');
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
      this.subDomain = '';
    } else {
      this.subDomain = domain.split('.')[0];
    }
  }

}
