import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ph-setup-error',
  templateUrl: './setup-error.component.html',
  styleUrls: ['./setup-error.component.scss']
})
export class SetupErrorComponent implements OnInit {

  @Input() errors = [];

  constructor() { }

  ngOnInit() {
  }

}
