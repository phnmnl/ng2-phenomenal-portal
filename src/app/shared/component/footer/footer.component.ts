import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fl-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private logo_white = "assets/img/logo/phenomenal_white_30_30.png";
  private euro_flag = "assets/img/logo/euro_flag.jpg";

  constructor() { }

  ngOnInit() {
  }

}
