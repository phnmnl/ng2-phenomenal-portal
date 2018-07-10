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
import { BsDropdownModule } from 'ngx-bootstrap';
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
import { ProgressBarComponent } from './shared/component/progress-bar/progress-bar.component';
import { CreDashboardComponent } from './cre-dashboard/cre-dashboard.component';
import { ClipboardModule } from 'ngx-clipboard';
import 'hammerjs';
import { RouterModule } from '@angular/router';
import { UserService } from './shared/service/user/user.service';
import { TermAndConditionComponent } from './login/term-and-condition/term-and-condition.component';
import { OpenStackMetadataService } from './shared/service/cloud-provider-metadata/open-stack-metadata.service';
import { ErrorService as PhnErrorService } from './shared/service/error/error.service';
import { AppConfig } from './app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtHelper } from 'angular2-jwt';
import { BlockUIModule } from 'ng-block-ui';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule, MatGridListModule,
  MatInputModule,
  MatOptionModule, MatProgressSpinnerModule,
  MatSelectModule, MatSliderModule, MatSlideToggleModule, MatStepperModule
} from '@angular/material';

import { UserAuthenticatedGuard } from "./shared/guard/UserAuthenticatedGuard";
import { AcceptedTermsGuard } from "./shared/guard/AcceptedTermsGuard";
import { DeployementService } from "./shared/service/deployer/deployement.service";
import { LogMonitorComponent } from './log-monitor/log-monitor.component';
import {
  ModalDialogComponent,
  ModalDialogContentComponent
} from './shared/component/modal-dialog/modal-dialog.component';
import {
  ErrorModalDialogComponent,
  ErrorModalDialogContentComponent
} from './shared/component/error-modal-dialog/error-modal-dialog.component';
import { CanDeactivateGuard } from "./shared/guard/CanDeactivateGuard";
import { ProviderSelectorComponent } from './setup/provider-selector/provider-selector.component';
import { ProviderCredentialsComponent } from './setup/provider-credentials/provider-credentials.component';
import { ProviderInfoComponent } from './setup/provider-info/provider-info.component';
import { ProviderParametersComponent } from './setup/provider-parameters/provider-parameters.component';
// import { BaseProviderCredentialsComponent } from './setup/provider-credentials/base-provider-credentials/base-provider-credentials.component';
import { AwsProviderCredentialsComponent } from './setup/provider-credentials/aws-provider-credentials/aws-provider-credentials.component';
import { SetupErrorComponent } from './setup/setup-error/setup-error.component';
import { CloudProviderMetadataService } from "./shared/service/cloud-provider-metadata/cloud-provider-metadata.service";
import { AwsMetadataService } from "./shared/service/cloud-provider-metadata/aws-metadata.service";
import { ServicesCredentialsComponent } from './setup/services-credentials/services-credentials.component';
import { DeployConfirmComponent } from './setup/deploy-confirm/deploy-confirm.component';
import { OpenstackProviderCredentialsComponent } from './setup/provider-credentials/openstack-provider-credentials/openstack-provider-credentials.component';
import { GcpProviderCredentialsComponent } from './setup/provider-credentials/gcp-provider-credentials/gcp-provider-credentials.component';
import { GcpMetadataService } from "./shared/service/cloud-provider-metadata/gcp-metadata.service";
import { PublicGalaxyInstanceComponent } from './public-galaxy-instance/public-galaxy-instance.component';
import { GalaxyPublicInstanceRegistrationComponent } from './public-galaxy-instance/galaxy-public-instance-registration/galaxy-public-instance-registration.component';

/**
 * To set the global environment variables
 *
 * @param config
 *
 */
export function SSOConfigService(config: AppConfig) {
  return new ConfigService(config.getConfig('tsi_portal_url'), config.getConfig('aap_url'));
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
    ProgressBarComponent,
    CreDashboardComponent,
    TermAndConditionComponent,
    LogMonitorComponent,
    ModalDialogComponent,
    ModalDialogContentComponent,
    ErrorModalDialogComponent,
    ErrorModalDialogContentComponent,
    ProviderSelectorComponent,
    ProviderCredentialsComponent,
    ProviderInfoComponent,
    ProviderParametersComponent,
    AwsProviderCredentialsComponent,
    SetupErrorComponent,
    ServicesCredentialsComponent,
    DeployConfirmComponent,
    OpenstackProviderCredentialsComponent,
    GcpProviderCredentialsComponent,
    PublicGalaxyInstanceComponent,
    GalaxyPublicInstanceRegistrationComponent,
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
    MatCheckboxModule,
    MatStepperModule,
    MatGridListModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    BsDropdownModule.forRoot()
  ],
  entryComponents: [NgbdModalContentComponent, ModalDialogContentComponent, ErrorModalDialogContentComponent],
  providers: [
    BreadcrumbService,
    WikiService,
    JenkinsReportService,
    ApplicationLibraryService,
    UserService,
    UserAuthenticatedGuard,
    AcceptedTermsGuard,
    CanDeactivateGuard,
    DeployementService,
    ApplicationService,
    AuthService,
    CloudProviderParametersService,
    DeploymentService,
    ErrorService,
    CredentialService,
    TokenService,
    AccountService,
    CloudProviderMetadataService,
    AwsMetadataService,
    OpenStackMetadataService,
    GcpMetadataService,
    JwtHelper,
    ConfigurationService,
    PhnErrorService,
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
