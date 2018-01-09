import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {UserService} from "app/shared/service/user/user.service";
import {AuthService} from "ng2-cloud-portal-service-lib";

@Injectable()
export class UserAuthenticatedGuard implements CanActivate {

  constructor(private router: Router,
              private userService: UserService,
              private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("Checking if there exists a user in the current local session");
    if (this.authService.credentialService.getUsername()) {
      console.log("A user exists in the current local session");
      return true;
    }else {
      console.log("A user doesn't exist in the current local session");
      // force cleaning local session
      this.userService.logout();
      // avoid the requested route and redirect to login
      this.router.navigate(['/login']);
      return false;
    }
  }
}