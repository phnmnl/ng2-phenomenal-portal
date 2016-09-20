import { BrowserModule }          from '@angular/platform-browser';
import { NgModule }               from '@angular/core';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';
import { routing,
         appRoutingProviders }    from './app.routing';

import { AppComponent }           from './app.component';
import { ApplicationComponent } from './application-library/application-list/application/application.component';
import { BreadcrumbComponent }    from "./shared/component/breadcrumb/breadcrumb.component";
import { CloudResearchEnvironmentComponent } from './cloud-research-environment/cloud-research-environment.component';
import { CloudResearchEnvironmentLocalInstallationComponent } from './cloud-research-environment-local-installation/cloud-research-environment-local-installation.component';
import { CloudResearchEnvironmentLocalInstallationInstructionComponent } from './cloud-research-environment-local-installation-instruction/cloud-research-environment-local-installation-instruction.component';
import { HeaderComponent }        from './shared/component/header/header.component';
import { HelpComponent }          from './help/help.component';
import { HelpTopicComponent }     from './help/help-topic/help-topic.component';
import { HomeComponent }          from './home/home.component';
import { FooterComponent }        from './shared/component/footer/footer.component';

import { CarouselComponent }      from './shared/component/carousel/carousel.component';
import { SlideComponent }         from './shared/component/carousel/slide/slide.component';

import { CollapseDirective,
         ModalModule }            from 'ng2-bootstrap';

import { BreadcrumbService }      from './shared/component/breadcrumb/breadcrumb.service';
import { WikiService }            from './shared/service/wiki/wiki.service';
import { ApplicationLibraryComponent } from './application-library/application-library.component';
import { ApplicationListComponent } from './application-library/application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';

import { FilterPipe } from './shared/pipe/filter.pipe';


@NgModule({
  declarations: [
      AppComponent,
      ApplicationComponent,
      ApplicationLibraryComponent,
      ApplicationListComponent,
      ApplicationDetailComponent,
      BreadcrumbComponent,
      CarouselComponent,
      CloudResearchEnvironmentComponent,
      CloudResearchEnvironmentLocalInstallationComponent,
      CloudResearchEnvironmentLocalInstallationInstructionComponent,
      HeaderComponent,
      HelpComponent,
      HelpTopicComponent,
      HomeComponent,
      FooterComponent,
      SlideComponent,

      CollapseDirective,

      FilterPipe
  ],
  imports: [
      BrowserModule,
      FormsModule,
      HttpModule,
      ModalModule,
      routing
  ],
  providers: [
      appRoutingProviders,
      BreadcrumbService,
      WikiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
