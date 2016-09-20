import { RouterModule } from '@angular/router';

import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationLibraryComponent } from './application-library/application-library.component';
import { CloudResearchEnvironmentComponent } from './cloud-research-environment';
import { CloudResearchEnvironmentLocalInstallationComponent } from './cloud-research-environment-local-installation';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CloudResearchEnvironmentLocalInstallationInstructionComponent } from './cloud-research-environment-local-installation-instruction/';
import { HelpComponent } from './help/help.component';
import { HelpTopicComponent } from './help/help-topic/help-topic.component';

/**
 * @auther Sijin He
 * @date 04/08/2016
 * Project Phenomenal, EMBL-EBI
 */
const APP_ROUTES = [
  { path: 'app-library', component: ApplicationLibraryComponent},
  { path: 'app-library/:id', component: ApplicationDetailComponent},
  { path: 'cloud-research-environment', component: CloudResearchEnvironmentComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation', component: CloudResearchEnvironmentLocalInstallationComponent},
  { path: 'cloud-research-environment/cloud-research-environment-local-installation-instruction', component: CloudResearchEnvironmentLocalInstallationInstructionComponent},
  { path: 'help', component: HelpComponent},
  { path: 'help/:id', component: HelpTopicComponent},
  { path: 'home', component: HomeComponent},
  { path: '404', component: NotFoundComponent},
  // { path: '', component: HomeComponent},
  { path: '**', redirectTo: '/home'}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
