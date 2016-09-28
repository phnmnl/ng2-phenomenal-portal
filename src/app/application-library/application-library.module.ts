import { NgModule } from "@angular/core"
import {ApplicationComponent} from "./application/application.component";
import {ApplicationLibraryComponent} from "./application-library.component";
import {ApplicationListComponent} from "./application-list/application-list.component";
import {ApplicationDetailComponent} from "./application-detail/application-detail.component";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FilterPipe} from "../shared/pipe/filter.pipe";
import {applicationLibraryRouting} from "./application-library.routing";

/**
 * @auther Dr. Sijin He
 * @date 27/09/2016
 * Project Phenomenal, EMBL-EBI
 */

@NgModule({
  declarations: [
    ApplicationComponent,
    ApplicationLibraryComponent,
    ApplicationListComponent,
    ApplicationDetailComponent,
    FilterPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    applicationLibraryRouting
  ]
})
export class ApplicationLibraryModule {}
