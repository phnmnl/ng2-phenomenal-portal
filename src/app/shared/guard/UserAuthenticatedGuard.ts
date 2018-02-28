import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from "app/shared/service/user/user.service";
import { AuthService } from "ng2-cloud-portal-service-lib";
import { Observable } from "rxjs/Observable";

@Injectable()
export class UserAuthenticatedGuard implements CanActivate {

  constructor(private router: Router,
              private userService: UserService,
              private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("Checking if there exists a user in the current local session");
    return this.userService.isUserAuthorized()
      .map((user) => {
        console.log("User properly authenticated", user);
        return true;
      })
      .catch((error) => {
        console.log("A user doesn't exist in the current local session");
        // force cleaning local session
        this.userService.logout();
        // get return url from route parameters or default to '/'
        let returnUrl = state.url;
        let queryParams = returnUrl ? {'returnUrl': returnUrl} : {};
        // avoid the requested route and redirect to login
        this.router.navigate(['/login'], {queryParams: queryParams});
        return Observable.throw(false);
      });
  }
}
