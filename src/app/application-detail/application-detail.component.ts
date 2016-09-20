import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { ROUTER_DIRECTIVES, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Application } from '../application-library/application-list/application/application';
import { ApplicationsDatabaseService } from '../shared/service/applications-database/applications-database.service';

import { BreadcrumbService } from '../shared/breadcrumb/breadcrumb.service';

@Component({
  moduleId: module.id,
  selector: 'fl-application-detail',
  templateUrl: 'application-detail.component.html',
  styleUrls: ['application-detail.component.css'],
  providers: [ApplicationsDatabaseService],
  directives: [ROUTER_DIRECTIVES]
})

export class ApplicationDetailComponent implements OnInit {

  id: string;
  applications$: Observable<Application[]>;
  @ViewChild('app') app;
  public isLoading = false;

  constructor(
    private service: ApplicationsDatabaseService,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private renderer: Renderer
  ) {
    this.id = activatedRoute.snapshot.params['id'];

    breadcrumbService.addFriendlyNameForRoute('/app-library/' + this.id, ' '); // Initialise as empty string

  }

  ngOnInit() {
    console.log('hello *Appplication detail* component');

    this.applications$ = this.service.applications$;
    this.isLoading = true;

    this.service.load(this.id, () => {
      this.isLoading = false;
    });
  }

  ngAfterViewChecked() {
    if (this.app !== undefined) {
      let app_name = this.app.nativeElement.innerText;
      this.breadcrumbService.addFriendlyNameForRoute('/app-library/' + this.id, app_name);
    }
  }

}
