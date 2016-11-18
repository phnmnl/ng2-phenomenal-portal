import {Component, ViewContainerRef} from '@angular/core';
import {BreadcrumbService} from './shared/component/breadcrumb/breadcrumb.service';

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
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/local-installation', 'Local Installation');
    breadcrumbService.addFriendlyNameForRoute('/cloud-research-environment/instruction', 'Local Installation Instruction');
    breadcrumbService.addFriendlyNameForRoute('/dashboard', 'Dashboard');
    breadcrumbService.addFriendlyNameForRoute('/help', 'Help');
    breadcrumbService.addFriendlyNameForRoute('/workflow', 'Create your Cloud Research Environment (CRE)');
    breadcrumbService.addFriendlyNameForRoute('/login', 'Login / Sign Up');
    breadcrumbService.addFriendlyNameForRoute('/register', 'Sign Up');
    breadcrumbService.addFriendlyNameForRoute('/statistics', 'Dashboard - VRE Site Statistics');
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
