import { HostListener, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';

export abstract class CanComponentDeactivate {

  public abstract canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event) {
    if (!this.canDeactivate())
      return $event.returnValue = false;
  }
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  canDeactivate(component: CanComponentDeactivate,
                route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot) {

    let url: string = state.url;
    console.log('Url: ' + url);

    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
