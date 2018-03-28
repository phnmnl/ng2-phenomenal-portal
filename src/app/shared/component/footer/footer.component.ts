import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../app.config";

@Component({
  selector: 'ph-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private _logo_white = 'assets/img/logo/phenomenal_white_4x.png';
  private _euro_flag = 'assets/img/logo/euro_flag.jpg';

  constructor(private config: AppConfig) {
  }

  ngOnInit() {
  }

  get logo_white(): string {
    return this._logo_white;
  }

  get euro_flag(): string {
    return this._euro_flag;
  }

  get version(): string {
    return this.config.getPackageInfo()["version"];
  }
}
