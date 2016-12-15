import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'ph-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {

  @Input() progress: number;
  constructor() { }

  ngOnInit() {
  }

}
