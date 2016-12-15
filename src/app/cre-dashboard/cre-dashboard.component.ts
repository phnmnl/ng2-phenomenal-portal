import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css']
})
export class CreDashboardComponent implements OnInit {

  private _galaxy_icon = 'assets/img/logo/galaxy.png';
  private _text = 'http://public.phenomenal-h2020.eu/';
  constructor() { }

  get galaxy_icon(): string {
    return this._galaxy_icon;
  }

  get text(): string {
    return this._text;
  }

  ngOnInit() {
  }

}
