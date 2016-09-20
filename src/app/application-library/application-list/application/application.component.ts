import { Component, OnInit, Input } from '@angular/core';
import { Application } from './application';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'fl-application',
  templateUrl: 'application.component.html',
  styleUrls: ['application.component.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class ApplicationComponent implements OnInit {
  @Input() application: Application;
  applicationId: number;
  constructor() { }

  ngOnInit() {
  }

}
