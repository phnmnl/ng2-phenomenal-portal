import { Component, Input, OnInit } from '@angular/core';
import { DeploymentInstance } from "../../service/deployer/deploymentInstance";
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ph-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  providers: [NgbProgressbarConfig]
})
export class ProgressBarComponent implements OnInit {

  @Input("progress") deployment: DeploymentInstance;


  status: string[] = [
    'Initialising ...',
    'Applying Cloud Credentials ...',
    'Checking the Application ...',
    'Setting up the Application ...',
    'Adding Deployment Server ...',
    'Setting up Deployment Server ...',
    'Starting Deployment Server (This may take a while, please be patient)...',
    'Running Deployment Server (This may take a while, please be patient) ...',
    'Setting up Cloud Research Environment ...',
    'Running Cloud Research Environment ...',
    'Cloud Research Environment is Ready for Use!',
  ];

  constructor(config: NgbProgressbarConfig) {
    // customize default values of progress bars used by this component tree
    config.max = 1000;
    config.striped = true;
    config.animated = true;
    config.type = 'success';
  }

  ngOnInit() {
  }

}
