import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CloudResearchEnvironmentComponent } from './static-page/cloud-research-environment/cloud-research-environment.component';
import { CRELocalInstallationComponent } from './static-page/cre-local-installation/cre-local-installation.component';
import { CRELocalInstallationInstructionComponent } from './static-page/cre-local-installation-instruction/cre-local-installation-instruction.component';
import { HelpComponent } from './help/help.component';
import { FaqComponent } from './help/faq/faq.component';
import { HelpTopicComponent } from './help/help-topic/help-topic.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { HomeComponent } from './static-page/home/home.component';
import { LoginComponent } from './login/login.component';
import { SetupCloudEnvironmentComponent } from './setup/setup-cloud-environment.component';
import { CreDashboardComponent } from './cre-dashboard/cre-dashboard.component';
import { TermAndConditionComponent } from './login/term-and-condition/term-and-condition.component';
import { UserAuthenticatedGuard } from "./shared/guard/UserAuthenticatedGuard";
import { AcceptedTermsGuard } from "./shared/guard/AcceptedTermsGuard";
import { TestCreComponent } from "./static-page/test-cre/test-cre.component";
import { CreRegistrationFormComponent } from "./setup/cre-registration-form/cre-registration-form.component";
import { CloudSetupComponent } from "./setup/cloud-setup/cloud-setup.component";
import { LogMonitorComponent } from "./log-monitor/log-monitor.component";

const routes: Routes = [
  {path: 'app-library', loadChildren: 'app/application-library/application-library.module#ApplicationLibraryModule'},
  {path: 'help', component: HelpComponent},
  {path: 'help/faq', component: FaqComponent},
  {path: 'help/:id', component: HelpTopicComponent},
  {path: 'login', component: LoginComponent},
  {path: 'logs', component: LogMonitorComponent, canActivate: [AcceptedTermsGuard]},
  {path: 'term-and-condition', component: TermAndConditionComponent, canActivate: [UserAuthenticatedGuard]},
  {path: 'cloud-research-environment-test', component: TestCreComponent, canActivate: [AcceptedTermsGuard]},
  {path: 'cloud-research-environment', component: CreDashboardComponent},
  {path: 'cloud-research-environment-dashboard', component: CreDashboardComponent, canActivate: [AcceptedTermsGuard]},
  {path: 'cloud-research-environment-registration', component: CreRegistrationFormComponent},
  {
    path: 'cloud-research-environment-setup',
    component: SetupCloudEnvironmentComponent,
    canActivate: [AcceptedTermsGuard],
    pathMatch: 'full'
  },
  {path: 'cloud-research-environment-setup-new', redirectTo: 'cloud-research-environment-setup', pathMatch: 'full'},
  {path: 'cloud-research-environment-docs', component: CloudResearchEnvironmentComponent, pathMatch: 'full'},
  {path: 'cloud-research-environment/local-installation', component: CRELocalInstallationComponent},
  {path: 'cloud-research-environment/instruction', component: CRELocalInstallationInstructionComponent},
  {path: 'cloud-provider-setup', component: CloudSetupComponent},
  {path: 'statistics', component: StatisticsComponent},
  {path: 'cre-dashboard', component: CreDashboardComponent},
  {path: 'home', component: HomeComponent},
  {path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class Ng2PhenomenalPortalRoutingModule {
}
