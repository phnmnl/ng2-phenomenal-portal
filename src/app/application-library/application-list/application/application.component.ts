import { Component, OnInit, Input } from '@angular/core';
import { Application } from './application';

@Component({
  selector: 'fl-application',
  templateUrl: 'application.component.html',
  styleUrls: ['application.component.css'],
})
export class ApplicationComponent implements OnInit {
  @Input() application: Application;
  applicationId: number;
  constructor() { }

  ngOnInit() {
  }

}
