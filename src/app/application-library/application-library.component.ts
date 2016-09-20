import { Component, OnInit } from '@angular/core';
import { ApplicationFilterComponent } from './application-filter';
import { ApplicationListComponent } from './application-list';
import { ApplicationSearchBarComponent } from './application-search-bar';

@Component({
  moduleId: module.id,
  selector: 'fl-application-library',
  templateUrl: 'application-library.component.html',
  styleUrls: ['application-library.component.css'],
  directives: [ApplicationFilterComponent, ApplicationListComponent, ApplicationSearchBarComponent]
})
export class ApplicationLibraryComponent implements OnInit {

  constructor() {

  }

  ngOnInit() {
  }

}
