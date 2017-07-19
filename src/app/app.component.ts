import {Component, ViewContainerRef} from '@angular/core';
import {BreadcrumbService} from './shared/component/breadcrumb/breadcrumb.service';

@Component({
  selector: 'ph-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef;

  constructor(private breadcrumbService: BreadcrumbService,
              viewContainerRef: ViewContainerRef) {
    breadcrumbService.addFriendlyNameForRoute('/', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/home', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/app-library', 'App Library - Service Catalogue');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/local-installation', 'Local Installation');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/instruction', 'Local Installation Instruction');
    breadcrumbService.addFriendlyNameForRoute('/term-and-condition', 'Terms and Conditions');
    breadcrumbService.addFriendlyNameForRoute('/help', 'Help');
    breadcrumbService.addFriendlyNameForRoute('/help/faq', 'FAQs');
    breadcrumbService.addFriendlyNameForRoute('/login', 'Welcome to Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/setup', 'Setup');
    breadcrumbService.addFriendlyNameForRoute('/statistics', 'VRE Site Statistics');
    breadcrumbService.addFriendlyNameForRoute('/cre-dashboard', 'Cloud Research Environment Dashboard');
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
