import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {BreadcrumbComponent} from './shared/component/breadcrumb/breadcrumb.component';
import {CloudResearchEnvironmentComponent} from './static-page/cloud-research-environment/cloud-research-environment.component';
import {CRELocalInstallationComponent} from './static-page/cre-local-installation/cre-local-installation.component';
import {
  CRELocalInstallationInstructionComponent
} from './static-page/cre-local-installation-instruction/cre-local-installation-instruction.component';
import {HeaderComponent} from './shared/component/header/header.component';
import {HelpComponent} from './help/help.component';
import {HelpTopicComponent} from './help/help-topic/help-topic.component';
import {HomeComponent} from './static-page/home/home.component';
import {FooterComponent} from './shared/component/footer/footer.component';
import {CarouselComponent} from './shared/component/carousel/carousel.component';
import {SlideComponent} from './shared/component/carousel/slide/slide.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {CollapseModule, ModalModule} from 'ng2-bootstrap';
import {BreadcrumbService} from './shared/component/breadcrumb/breadcrumb.service';
import {WikiService} from './shared/service/wiki/wiki.service';
import {Ng2PhenomenalPortalRoutingModule} from './app-routing.module';
import {JenkinsReportService} from './shared/service/jenkins-report/jenkins-report.service';
import {ApplicationLibraryService} from './shared/service/application-library/application-library.service';
import {LoginComponent} from './login/login.component';
import {
  ApplicationService,
  AuthService,
  CloudCredentialsService,
  CredentialService,
  ConfigService,
  DeploymentService,
  ErrorService,
  TokenService} from 'ng2-cloud-portal-service-lib';
import {SetupCloudEnvironmentComponent} from './setup/setup-cloud-environment.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalComponent, NgbdModalContentComponent} from './shared/component/modal/modal.component';
import {
  ProgressBarModalComponent,
  ProgressBarModalContentComponent
} from './shared/component/progress-bar-modal/progress-bar-modal.component';
import { ProgressBarComponent } from './shared/component/progress-bar/progress-bar.component';
import { CreDashboardComponent } from './cre-dashboard/cre-dashboard.component';
import {ClipboardModule} from 'ngx-clipboard';
import { MaterialModule } from '@angular/material';
import 'hammerjs';
import {RouterModule} from '@angular/router';
import {GalaxyService} from './shared/service/galaxy/galaxy.service';
import {UserService} from './shared/service/user/user.service';
import {PhenomenalTokenService} from './shared/service/phenomenal-token/phenomenal-token.service';

export function SSOConfigService () {
  return new ConfigService('https://explore.api.portal.tsi.ebi.ac.uk/', 'https://api.aap.tsi.ebi.ac.uk/');

  // return new ConfigService('https://api.portal.tsi.ebi.ac.uk/', 'https://api.aap.tsi.ebi.ac.uk/');
  // return new ConfigService('http://localhost:8080/', 'https://api.aap.tsi.ebi.ac.uk/');
}

@NgModule({
  declarations: [
    AppComponent,
    BreadcrumbComponent,
    CarouselComponent,
    CloudResearchEnvironmentComponent,
    CRELocalInstallationComponent,
    CRELocalInstallationInstructionComponent,
    HeaderComponent,
    HelpComponent,
    HelpTopicComponent,
    HomeComponent,
    FooterComponent,
    SlideComponent,
    StatisticsComponent,
    LoginComponent,
    SetupCloudEnvironmentComponent,
    ModalComponent,
    NgbdModalContentComponent,
    ProgressBarModalComponent,
    ProgressBarModalContentComponent,
    ProgressBarComponent,
    CreDashboardComponent
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
    FormsModule,
    HttpModule,
    ModalModule,
    CollapseModule.forRoot(),
    NgbModule.forRoot(),
    MaterialModule,
    Ng2PhenomenalPortalRoutingModule,
    RouterModule
  ],
  entryComponents: [NgbdModalContentComponent, ProgressBarModalContentComponent],
  providers: [
    {
      provide: ConfigService,
      useFactory: SSOConfigService,
      deps: []
    },
    BreadcrumbService,
    WikiService,
    JenkinsReportService,
    ApplicationLibraryService,
    UserService,
    PhenomenalTokenService,

    ApplicationService,
    AuthService,
    CloudCredentialsService,
    DeploymentService,
    ErrorService,
    CredentialService,
    TokenService,
    GalaxyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
