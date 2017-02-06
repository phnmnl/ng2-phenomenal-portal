import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {ApplicationLibraryComponent} from './application-library.component';
import {ApplicationDetailComponent} from './application-detail/application-detail.component';

/**
 * @auther Sijin He
 * @date 04/08/2016
 * Project Phenomenal, EMBL-EBI
 */

// TODO: make child routes
const ApplicationLibrary_ROUTES: Routes = [
  {path: '', component: ApplicationLibraryComponent},
  {path: ':id', component: ApplicationDetailComponent}
];

export const applicationLibraryRouting = RouterModule.forChild(ApplicationLibrary_ROUTES);
