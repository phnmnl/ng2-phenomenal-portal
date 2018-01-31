import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { BreadcrumbService } from './shared/component/breadcrumb/breadcrumb.service';
import { UserService } from "./shared/service/user/user.service";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";

@Component({
  selector: 'ph-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private returnUrl;
  private previousUrl;
  private checkAuthorization;

  constructor(private breadcrumbService: BreadcrumbService,
              public userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private viewContainerRef: ViewContainerRef) {
    // register route names
    breadcrumbService.addFriendlyNameForRoute('/', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/home', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/app-library', 'App Library - Service Catalogue');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-docs', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-test', 'Public Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-dashboard', 'My Cloud Research Environments');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/local-installation', 'Local Installation');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/instruction', 'Local Installation Instruction');
    breadcrumbService.addFriendlyNameForRoute('/term-and-condition', 'Terms and Conditions');
    breadcrumbService.addFriendlyNameForRoute('/help', 'Help');
    breadcrumbService.addFriendlyNameForRoute('/help/faq', 'FAQs');
    breadcrumbService.addFriendlyNameForRoute('/logs', 'Deployment logs');
    breadcrumbService.addFriendlyNameForRoute('/login', 'Welcome to Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup?state=true', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup?state=false', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/statistics', 'VRE Site Statistics');
    breadcrumbService.addFriendlyNameForRoute('/cre-dashboard', 'Cloud Research Environment Dashboard');
    // hidden routes
    breadcrumbService.hideRoute('/logs');
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
    let user = this.userService.getCurrentUser();
    if (user) {
      this.registerAuthChecker();
    } else {
      this.userService.getObservableCurrentUser().subscribe(user => {
        this.registerAuthChecker();
      });
    }
    this.router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
          this.previousUrl = event.url;
      });
  }

  ngOnDestroy() {
    this.deRegisterAuthChecker();
  }

  private registerAuthChecker() {
    this.checkAuthorization = setInterval(() => {
      console.log("Periodic authorization check...");
      this.userService.isUserAuthorized().subscribe(
        (user) => {
          if (!user) this.redirectToLogin();
        },
        () => {
          console.log("User not authenticated!!!");
          this.redirectToLogin();
        });
    }, 1000 * 60);
  }

  private deRegisterAuthChecker() {
    if (this.checkAuthorization) {
      console.log("Cancelling periodic authorization check...");
      clearInterval(this.checkAuthorization);
    }
  }

  private redirectToLogin() {
    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.previousUrl;
    let queryParams = returnUrl ? {'returnUrl': returnUrl } : {};
    this.userService.logout();
    this.deRegisterAuthChecker();
    this.router.navigate(['/login'], {queryParams: queryParams});
  }
}
