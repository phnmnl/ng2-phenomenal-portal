import { Component, Input } from '@angular/core';
import { Application } from '../../shared/model/application/application';

@Component({
  selector: 'ph-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
})

export class ApplicationListComponent {

  @Input() application: Application;

  constructor() {

  }

}
