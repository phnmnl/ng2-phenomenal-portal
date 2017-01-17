import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CloudResearchEnvironmentComponent} from './home/cloud-research-environment/cloud-research-environment.component';
import {CloudResearchEnvironmentLocalInstallationComponent} from './home/cre-local-installation';
import {CloudResearchEnvironmentLocalInstallationInstructionComponent} from './home/cre-local-installation-instruction';
import {HelpComponent} from './help/help.component';
import {HelpTopicComponent} from './help/help-topic/help-topic.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {HomeComponent} from './home/home.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {WorkflowComponent} from './workflow/workflow.component';
import {SetupCloudEnvironmentComponent} from './setup-cloud-environment/setup-cloud-environment.component';
import {CreDashboardComponent} from './cre-dashboard/cre-dashboard.component';

const routes: Routes = [
  {path: 'app-library', loadChildren: 'app/application-library/application-library.module#ApplicationLibraryModule'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'cloud-research-environment', component: CloudResearchEnvironmentComponent},
  {
    path: 'cloud-research-environment/local-installation',
    component: CloudResearchEnvironmentLocalInstallationComponent
  },
  {
    path: 'cloud-research-environment/instruction',
    component: CloudResearchEnvironmentLocalInstallationInstructionComponent
  },
  {path: 'help', component: HelpComponent},
  {path: 'help/:id', component: HelpTopicComponent},
  {path: 'login', component: WorkflowComponent},
  {path: 'setup', component: SetupCloudEnvironmentComponent},
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
