import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CloudResearchEnvironmentComponent } from './home/cloud-research-environment/cloud-research-environment.component';

import { CloudResearchEnvironmentLocalInstallationComponent } from './home/cloud-research-environment-local-installation/cloud-research-environment-local-installation.component';
import { CloudResearchEnvironmentLocalInstallationInstructionComponent } from './home/cloud-research-environment-local-installation-instruction/cloud-research-environment-local-installation-instruction.component';

import { HelpComponent } from './help/help.component';
import { HelpTopicComponent } from './help/help-topic/help-topic.component';
import { ApplicationLibraryComponent } from './application-library/application-library.component';
import { ApplicationDetailComponent } from './application-library/application-detail/application-detail.component';
import { StatisticsComponent } from './statistics/statistics.component';

/**
 * @auther Sijin He
 * @date 04/08/2016
 * Project Phenomenal, EMBL-EBI
 */

const appRoutes: Routes = [
  // { path: 'app-library', component: ApplicationLibraryComponent},
  {path: 'app-library', loadChildren: 'app/application-library/application-library.module#ApplicationLibraryModule'},
  // { path: 'app-library/:id', component: ApplicationDetailComponent},
  { path: 'cloud-research-environment', component: CloudResearchEnvironmentComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation', component: CloudResearchEnvironmentLocalInstallationComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation-instruction', component: CloudResearchEnvironmentLocalInstallationInstructionComponent},
  { path: 'help', component: HelpComponent},
  { path: 'help/:id', component: HelpTopicComponent},
  { path: 'statistics', component: StatisticsComponent},
  { path: 'home', component: HomeComponent},
  { path: '**', redirectTo: '/home'}
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
