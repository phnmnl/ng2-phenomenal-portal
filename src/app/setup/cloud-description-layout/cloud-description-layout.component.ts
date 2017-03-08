import {Component, OnInit, Input} from '@angular/core';
import {CloudProvider} from '../cloud-provider';

@Component({
  selector: 'ph-cloud-description-layout',
  templateUrl: './cloud-description-layout.component.html',
  styleUrls: ['./cloud-description-layout.component.scss']
})
export class CloudDescriptionLayoutComponent implements OnInit {

  @Input() _cloudProvider: CloudProvider;
  private _phenomenal_logo = 'assets/img/logo/default_app.png';

  constructor() { }

  ngOnInit() {

  }

  get cloudProvider(): CloudProvider {
    return this._cloudProvider;
  }

  set cloudProvider(value: CloudProvider) {
    this._cloudProvider = value;
  }
}
