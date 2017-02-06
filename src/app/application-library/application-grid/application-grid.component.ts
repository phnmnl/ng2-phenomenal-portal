import {Component, OnInit, Input} from '@angular/core';
import {Application} from '../../shared/model/application/application';

@Component({
  selector: 'ph-application-grid',
  templateUrl: './application-grid.component.html',
  styleUrls: ['./application-grid.component.css'],
})
export class ApplicationGridComponent implements OnInit {
  @Input() application: Application;
  applicationId: number;

  constructor() {
  }

  ngOnInit() {
  }

}
