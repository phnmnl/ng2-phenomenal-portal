import { Injectable } from '@angular/core';
import { Route } from "@angular/router";

@Injectable()
export class BreadcrumbService {

  private hiddenRoutes = [];
  private routeFriendlyNames: any = {};

  constructor() {
  }

  /**
   * Specify a friendly name for the corresponding route. Please note this should be the full url of the route,
   * as in the same url you will use to call router.navigate().
   *
   * @param route
   * @param name
   */
  addFriendlyNameForRoute(route: string, name: string): void {
    this.routeFriendlyNames[route] = name;
  }

  /**
   * Show the friendly name for a given url. If no match is found the url (without the leading '/') is shown.
   *
   * @param route
   * @returns {*}
   */
  getFriendlyNameForRoute(route: Route | string): string {
    let url = <string> route.toString();
    // console.log("Searching route", url);
    let name = this.routeFriendlyNames[url];
    let hidden = name in this.hiddenRoutes;
    let paramsStart = url.lastIndexOf('/');
    if (paramsStart > 0) {
      let simplified = url.substring(0, paramsStart);
      hidden = simplified in this.hiddenRoutes;
      if (!hidden)
        if (this.routeFriendlyNames[simplified]) {
          name = url.substring(paramsStart + 1).replace(new RegExp('-', 'g'), ' ');
        } else {
          name = simplified;
          // console.log("ParamID:", name);
        }
    }
    // console.log("Found route", name);
    if (!name) {
      let paramsStart = url.indexOf('?');
      if (paramsStart > 0) {
        let simplfiedRoute = url.substring(0, paramsStart);
        hidden = simplfiedRoute in this.hiddenRoutes;
        name = this.routeFriendlyNames[simplfiedRoute];
      }
    }

    if (!name && !hidden) {
      name = url.substr(1, url.length);
    }

    // console.log("The route NAME", name);

    return name;
  }

  hideRoute(route: string) {
    this.hiddenRoutes.push(route);
  }

  hidden(route: string) {
    if (route) {
      let url = <string> route.toString();

      if (this.hiddenRoutes.indexOf(url) > -1) return true;
      let paramsStart = url.lastIndexOf('/');
      if (paramsStart > 0) {
        return this.hiddenRoutes.indexOf(url.substring(0, paramsStart)) > -1;
      }
      paramsStart = url.indexOf('?');
      if (paramsStart > 0) {
        return this.hiddenRoutes.indexOf(url.substring(0, paramsStart)) > -1;
      }
    }
    return false;
  }
}
