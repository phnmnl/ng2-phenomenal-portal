import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ph-cre-local-installation',
  templateUrl: './cre-local-installation.component.html',
  styleUrls: ['./cre-local-installation.component.css'],
})
export class CRELocalInstallationComponent implements OnInit {
  get img1(): string {
    return this._img1;
  }

  get img2(): string {
    return this._img2;
  }

  get img3(): string {
    return this._img3;
  }

  private _img1 = 'assets/img/cloud-research-environment-installation/img1.png';
  private _img2 = 'assets/img/cloud-research-environment-installation/img2.png';
  private _img3 = 'assets/img/cloud-research-environment-installation/img3.png';

  constructor() {
  }

  ngOnInit() {
  }

}
