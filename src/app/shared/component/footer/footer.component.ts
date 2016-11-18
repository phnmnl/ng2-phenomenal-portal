import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ph-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  get logo_white(): string {
    return this._logo_white;
  }

  get euro_flag(): string {
    return this._euro_flag;
  }

  private _logo_white = 'assets/img/logo/phenomenal_white_4x.png';
  private _euro_flag = 'assets/img/logo/euro_flag.jpg';

  constructor() {
  }

  ngOnInit() {
  }

}
