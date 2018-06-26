import { Component, Input, OnInit } from '@angular/core';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { Deployment } from "../../service/deployer/deployment";
import { DeploymentStatus } from "../../service/deployer/deployment-status";

@Component({
  selector: 'ph-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  providers: [NgbProgressbarConfig]
})
export class ProgressBarComponent implements OnInit {

  @Input("progress") deployment: Deployment;

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

  progressDescription = "";
  progress: number = 0;
  step: string = "";
  task: string = "";
  lastLog: string = "";


  constructor(config: NgbProgressbarConfig) {
    // customize default values of progress bars used by this component tree
    config.max = 1000;
    config.striped = true;
    config.animated = true;
    config.type = 'success';
  }

  ngOnInit() {
    this.deployment.getDeploymentStatusAsObservable().subscribe((status: DeploymentStatus) => {
      if (status && status.transition) {
        let transition = status.transition;
        this.progress = transition.progress;
        this.step = transition.step;
        this.task = transition.task;
        this.lastLog = this.deployment.lastLogLine;
        this.progressDescription = status.transition.stepNumber + " of " + status.transition.numberOfSteps;
      }
    });
  }
}
