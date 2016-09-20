import { Component, OnInit } from '@angular/core';
import {FORM_DIRECTIVES} from '@angular/common';
import {ROUTER_DIRECTIVES, Router, NavigationEnd} from '@angular/router';
import {BreadcrumbService} from './breadcrumb.service';

@Component({
  moduleId: module.id,
  selector: 'fl-breadcrumb',
  directives: [FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  templateUrl: 'breadcrumb.component.html',
  styleUrls: ['breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {


  private _urls: string[];

  ngOnInit() {
  }
  constructor(private router: Router, private breadcrumbService: BreadcrumbService) {
    this._urls = new Array();
    this.router.events.subscribe((navigationEnd: NavigationEnd) => {
      this._urls.length = 0; // Fastest way to clear out array
      this.generateBreadcrumbTrail(navigationEnd.urlAfterRedirects ? navigationEnd.urlAfterRedirects : navigationEnd.url);
    });
  }

  generateBreadcrumbTrail(url: string): void {
    this._urls.unshift(url); // Add url to beginning of array (since the url is being recursively broken down from full url to its parent)
    if (url.lastIndexOf('/') > 0) {
      this.generateBreadcrumbTrail(url.substr(0, url.lastIndexOf('/'))); // Find last '/' and add everything before it as a parent route
    }
  }

  navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }

  friendlyName(url: string): string {
    return !url ? '' : this.breadcrumbService.getFriendlyNameForRoute(url);
  }
}
