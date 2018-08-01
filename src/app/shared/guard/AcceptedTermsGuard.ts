import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from "app/shared/service/user/user.service";
import { AuthService } from "ng2-cloud-portal-service-lib";
import { Observable } from "rxjs/Observable";

@Injectable()
export class AcceptedTermsGuard implements CanActivate {

  constructor(private router: Router,
              private userService: UserService,
              private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    // detect route and parameters
    let returnUrl = state.url;
    let queryParams = returnUrl ? {'returnUrl': returnUrl} : {};

    if (this.authService.credentialService.getUsername()) {
      return this.userService.findById(this.authService.credentialService.getUsername()).map(
        (userInfo) => {
          console.log("User info from backend service", userInfo);
          if (userInfo) {
            console.log("Fetched user info: ", userInfo);
            console.log("Route allowed");
            return true;
          } else {
            console.log("User with id '" + this.authService.credentialService.getUsername() + "' not found!");
            this.userService.logout();
            this.router.navigate(['/login'], {queryParams: queryParams});
            return false;
          }
        },
        (err) => {
          console.error(err);
          this.userService.logout();
          this.router.navigate(['/login'], {queryParams: queryParams});
          return false;
        }
      ).first();
    } else {
      console.log("Ops.....");
      this.router.navigate(['/login'], {queryParams: queryParams});
      return false;
    }
  }
}
