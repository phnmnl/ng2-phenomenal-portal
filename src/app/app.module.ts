import { BrowserModule }          from '@angular/platform-browser';
import { NgModule }               from '@angular/core';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { AppComponent }           from './app.component';
import { ApplicationComponent } from './application-library/application/application.component';
import { BreadcrumbComponent }    from "./shared/component/breadcrumb/breadcrumb.component";
import { CloudResearchEnvironmentComponent } from './home/cloud-research-environment/cloud-research-environment.component';
import { CloudResearchEnvironmentLocalInstallationComponent } from './home/cloud-research-environment-local-installation/cloud-research-environment-local-installation.component';
import { CloudResearchEnvironmentLocalInstallationInstructionComponent } from './home/cloud-research-environment-local-installation-instruction/cloud-research-environment-local-installation-instruction.component';
import { HeaderComponent }        from './shared/component/header/header.component';
import { HelpComponent }          from './help/help.component';
import { HelpTopicComponent }     from './help/help-topic/help-topic.component';
import { HomeComponent }          from './home/home.component';
import { FooterComponent }        from './shared/component/footer/footer.component';

import { CarouselComponent }      from './shared/component/carousel/carousel.component';
import { SlideComponent }         from './shared/component/carousel/slide/slide.component';
import { StatisticsComponent }    from './statistics/statistics.component';

import { CollapseDirective,
         ModalModule }            from 'ng2-bootstrap';

import { BreadcrumbService }      from './shared/component/breadcrumb/breadcrumb.service';
import { WikiService }            from './shared/service/wiki/wiki.service';
import {Ng2PhenomenalPortalRoutingModule} from "./app-routing.module";
import {JenkinsReportService} from "./shared/service/jenkins-report/jenkins-report.service";

@NgModule({
  declarations: [
      AppComponent,
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
      StatisticsComponent,

      CollapseDirective,

      StatisticsComponent
  ],
  imports: [
      BrowserModule,
      FormsModule,
      HttpModule,
      ModalModule,
      Ng2PhenomenalPortalRoutingModule
  ],
  providers: [
      BreadcrumbService,
      WikiService,
      JenkinsReportService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
