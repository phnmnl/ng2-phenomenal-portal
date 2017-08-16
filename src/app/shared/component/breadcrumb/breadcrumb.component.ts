import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {BreadcrumbService} from './breadcrumb.service';

@Component({
  selector: 'ph-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {


  _urls: string[];

  ngOnInit() {
  }

  constructor(private router: Router, private breadcrumbService: BreadcrumbService) {
    this._urls = [];
    this.router.events.subscribe((navigationEnd: NavigationEnd) => {
      this._urls.length = 0; // Fastest way to clear out array
      this.generateBreadcrumbTrail(navigationEnd.urlAfterRedirects ? navigationEnd.urlAfterRedirects : navigationEnd.url);
    });
  }

  generateBreadcrumbTrail(url: string): void {
    this._urls.unshift(url); // Add url to beginning of array (since the url is being recursively broken down from full url to its parent)
    if (url !== undefined && url.toString().lastIndexOf('/') > 0) {
      // Find last '/' and add everything before it as a parent route
      this.generateBreadcrumbTrail(url.toString().substr(0, url.toString().lastIndexOf('/')));
    }
  }

  navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }

  friendlyName(url: string): string {
    return !url ? '' : this.breadcrumbService.getFriendlyNameForRoute(url);
  }
}
