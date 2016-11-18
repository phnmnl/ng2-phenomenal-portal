import {Component} from '@angular/core';
import {Application} from '../../shared/model/application/application';
import {Input} from '@angular/core/src/metadata/directives';

@Component({
  selector: 'ph-application-list',
  templateUrl: 'application-list.component.html',
  styleUrls: ['application-list.component.css'],
})

export class ApplicationListComponent {

  @Input() application: Application;

  constructor() {

  }

}
