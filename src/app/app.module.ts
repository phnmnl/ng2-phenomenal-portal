import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './shared/component/breadcrumb/breadcrumb.component';
import { CloudResearchEnvironmentComponent } from './static-page/cloud-research-environment/cloud-research-environment.component';
import { CRELocalInstallationComponent } from './static-page/cre-local-installation/cre-local-installation.component';
import { CRELocalInstallationInstructionComponent } from './static-page/cre-local-installation-instruction/cre-local-installation-instruction.component';
import { HeaderComponent } from './shared/component/header/header.component';
import { HelpComponent } from './help/help.component';
import { HelpTopicComponent } from './help/help-topic/help-topic.component';
import { HomeComponent } from './static-page/home/home.component';
import { FooterComponent } from './shared/component/footer/footer.component';
import { CarouselComponent } from './shared/component/carousel/carousel.component';
import { SlideComponent } from './shared/component/carousel/slide/slide.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { CollapseModule, ModalModule } from 'ngx-bootstrap';
import { BreadcrumbService } from './shared/component/breadcrumb/breadcrumb.service';
import { WikiService } from './shared/service/wiki/wiki.service';
import { Ng2PhenomenalPortalRoutingModule } from './app-routing.module';
import { JenkinsReportService } from './shared/service/jenkins-report/jenkins-report.service';
import { ApplicationLibraryService } from './shared/service/application-library/application-library.service';
import { LoginComponent } from './login/login.component';
import {
  AccountService,
  ApplicationService,
  AuthService,
  CloudProviderParametersService,
  ConfigService,
  ConfigurationService,
  CredentialService,
  DeploymentService,
  ErrorService,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { SetupCloudEnvironmentComponent } from './setup/setup-cloud-environment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent, NgbdModalContentComponent } from './shared/component/modal/modal.component';
import {
  ProgressBarModalComponent,
  ProgressBarModalContentComponent
} from './shared/component/progress-bar-modal/progress-bar-modal.component';
import { ProgressBarComponent } from './shared/component/progress-bar/progress-bar.component';
import { CreDashboardComponent } from './cre-dashboard/cre-dashboard.component';
import { ClipboardModule } from 'ngx-clipboard';
import 'hammerjs';
import { RouterModule } from '@angular/router';
import { GalaxyService } from './shared/service/galaxy/galaxy.service';
import { UserService } from './shared/service/user/user.service';
import { PhenomenalTokenService } from './shared/service/phenomenal-token/phenomenal-token.service';
import { CreRegistrationFormComponent } from './setup/cre-registration-form/cre-registration-form.component';
import { PhenomenalSetupComponent } from './setup/phenomenal-setup/phenomenal-setup.component';
import { OstackSetupComponent } from './setup/ostack-setup/ostack-setup.component';
import { AwsSetupComponent } from './setup/aws-setup/aws-setup.component';
import { GcpSetupComponent } from './setup/gcp-setup/gcp-setup.component';
import { CloudDescriptionLayoutComponent } from './setup/cloud-description-layout/cloud-description-layout.component';
import { CloudSetupComponent } from './setup/cloud-setup/cloud-setup.component';
import { ValidatorComponent } from './setup/validator/validator.component';
import { FaqComponent } from './help/faq/faq.component';
import { TermAndConditionComponent } from './login/term-and-condition/term-and-condition.component';
import { CloudProviderMetadataService } from './shared/service/cloud-provider-metadata/cloud-provider-metadata.service';

import { AppConfig } from './app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtHelper } from 'angular2-jwt';
import { BlockUIModule } from 'ng-block-ui';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule
} from '@angular/material';


export function SSOConfigService(config: AppConfig) {

  return new ConfigService(config.getConfig('tsi_portal_url'), 'https://api.aap.tsi.ebi.ac.uk/');

}

export function initConfig(config: AppConfig) {
  return () => config.load();
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
    CreDashboardComponent,
    CreRegistrationFormComponent,
    PhenomenalSetupComponent,
    OstackSetupComponent,
    AwsSetupComponent,
    GcpSetupComponent,
    CloudDescriptionLayoutComponent,
    CloudSetupComponent,
    ValidatorComponent,
    FaqComponent,
    TermAndConditionComponent
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
    FormsModule,
    HttpModule,
    ModalModule,
    CollapseModule.forRoot(),
    NgbModule.forRoot(),
    Ng2PhenomenalPortalRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    BlockUIModule,
    MatCardModule,
    MatOptionModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  entryComponents: [NgbdModalContentComponent, ProgressBarModalContentComponent],
  providers: [
    BreadcrumbService,
    WikiService,
    JenkinsReportService,
    ApplicationLibraryService,
    UserService,
    PhenomenalTokenService,
    ApplicationService,
    AuthService,
    CloudProviderParametersService,
    DeploymentService,
    ErrorService,
    CredentialService,
    TokenService,
    GalaxyService,
    AccountService,
    CloudProviderMetadataService,
    JwtHelper,
    ConfigurationService,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfig],
      multi: true
    },
    {
      provide: ConfigService,
      useFactory: SSOConfigService,
      deps: [AppConfig]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
