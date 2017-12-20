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
  private currentUser: User;
  private removeMessageListener;
  private isCollapsed = false;
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

    this.userService.currentUserObservable.subscribe(user => {
      console.log("Updated user", user);
      this.currentUser = <User> user;
      if (this.currentUser) {
        if (this.currentUser.hasAcceptedTermConditions) {
          this.router.navigateByUrl('cloud-research-environment');
        } else {
          console.log("Already in terms & conditions");
        }
      } else {
        this.router.navigateByUrl('/home');
      }
    });
    this.removeMessageListener = this.userService.registerTokenListener(this.renderer);
  }

  ngOnDestroy() {
    if (this.removeMessageListener)
      this.removeMessageListener();
  }
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeMenu() {
    this.isCollapsed = false;
  }

  logout() {
    this.userService.logout();
    this.isCollapsed = false;
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
