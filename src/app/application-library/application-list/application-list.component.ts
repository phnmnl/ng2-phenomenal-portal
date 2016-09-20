import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Application } from './application';

import { ApplicationsDatabaseService } from '../../shared/service/applications-database/applications-database.service';

@Component({
  selector: 'fl-application-list',
  templateUrl: 'application-list.component.html',
  styleUrls: ['application-list.component.css'],
  providers: [ApplicationsDatabaseService]
})

export class ApplicationListComponent implements OnInit {

  applications$: Observable<Application[]>;
  public isLoading = false;
  content: string;

  constructor(
    private service: ApplicationsDatabaseService
  ) {

  }

  ngOnInit() {
    console.log('hello *AppDB* component');

    this.applications$ = this.service.applications$;
    this.isLoading = true;

    this.service.loadAll( () => {
      this.isLoading = false;
    });
  }
}
