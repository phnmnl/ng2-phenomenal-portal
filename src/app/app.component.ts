import { Component, ViewContainerRef } from '@angular/core';
import { BreadcrumbService } from './shared/component/breadcrumb/breadcrumb.service';

@Component({
  selector: 'fl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
      private breadcrumbService: BreadcrumbService,
      private viewContainerRef: ViewContainerRef
  ) {
    breadcrumbService.addFriendlyNameForRoute('/', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/home', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/app-library', 'App Library');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/cloud-research-environment-local-installation', 'Local Installation');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/cloud-research-environment-local-installation-instruction', 'Local Installation Instruction');
    breadcrumbService.addFriendlyNameForRoute('/help', 'Help');
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
