import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ph-setup-cloud-environment',
  templateUrl: './setup-cloud-environment.component.html',
  styleUrls: ['./setup-cloud-environment.component.css']
})
export class SetupCloudEnvironmentComponent implements OnInit {

  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';

  public _isChosen: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  get phenomenal_logo(): string {
    return this._phenomenal_logo;
  }

  get openstack_logo(): string {
    return this._openstack_logo;
  }

  get aws_logo(): string {
    return this._aws_logo;
  }

}
