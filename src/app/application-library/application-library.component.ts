import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {Application} from "../shared/model/application/application";
import {ApplicationsDatabaseService} from "../shared/service/applications-database/applications-database.service";

@Component({
  selector: 'fl-application-library',
  templateUrl: 'application-library.component.html',
  styleUrls: ['application-library.component.css'],
})
export class ApplicationLibraryComponent implements OnInit {

  applications$: Observable<Application[]>;
  public isLoading = false;
  content: string;
  public isList = false;

  constructor(
    private service: ApplicationsDatabaseService
  ) {

  }

  ngOnInit() {
    // console.log('hello *AppDB* component');

    this.applications$ = this.service.applications$;
    this.isLoading = true;

    this.service.loadAll( () => {
      this.isLoading = false;
    });
  }

  triigerList() {
    this.isList = !this.isList;
  }
}
