import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CloudResearchEnvironmentComponent} from "./home/cloud-research-environment/cloud-research-environment.component";
import {CloudResearchEnvironmentLocalInstallationComponent} from "./home/cloud-research-environment-local-installation/cloud-research-environment-local-installation.component";
import {CloudResearchEnvironmentLocalInstallationInstructionComponent} from "./home/cloud-research-environment-local-installation-instruction/cloud-research-environment-local-installation-instruction.component";
import {HelpComponent} from "./help/help.component";
import {HelpTopicComponent} from "./help/help-topic/help-topic.component";
import {StatisticsComponent} from "./statistics/statistics.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: 'app-library', loadChildren: 'app/application-library/application-library.module#ApplicationLibraryModule'},
  { path: 'cloud-research-environment', component: CloudResearchEnvironmentComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation', component: CloudResearchEnvironmentLocalInstallationComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation-instruction', component: CloudResearchEnvironmentLocalInstallationInstructionComponent},
  { path: 'help', component: HelpComponent},
  { path: 'help/:id', component: HelpTopicComponent},
  { path: 'statistics', component: StatisticsComponent},
  { path: 'home', component: HomeComponent},
  { path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class Ng2PhenomenalPortalRoutingModule { }
