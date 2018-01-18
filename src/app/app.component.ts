import { Component, ViewContainerRef } from '@angular/core';
import { BreadcrumbService } from './shared/component/breadcrumb/breadcrumb.service';

@Component({
  selector: 'ph-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private breadcrumbService: BreadcrumbService,
              private viewContainerRef: ViewContainerRef) {
    breadcrumbService.addFriendlyNameForRoute('/', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/home', 'Home');
    breadcrumbService.addFriendlyNameForRoute('/app-library', 'App Library - Service Catalogue');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-docs', 'Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-test', 'Test Our Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-dashboard', 'My Cloud Research Environments');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/local-installation', 'Local Installation');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/instruction', 'Local Installation Instruction');
    breadcrumbService.addFriendlyNameForRoute('/term-and-condition', 'Terms and Conditions');
    breadcrumbService.addFriendlyNameForRoute('/help', 'Help');
    breadcrumbService.addFriendlyNameForRoute('/help/faq', 'FAQs');
    breadcrumbService.addFriendlyNameForRoute('/login', 'Welcome to Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup?state=true', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment-setup?state=false', 'Setup New Cloud Research Environment');
    breadcrumbService.addFriendlyNameForRoute('/statistics', 'VRE Site Statistics');
    breadcrumbService.addFriendlyNameForRoute('/cre-dashboard', 'Cloud Research Environment Dashboard');
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
