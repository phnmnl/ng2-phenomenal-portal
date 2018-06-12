import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DeployementService } from "../shared/service/deployer/deployement.service";
import { ActivatedRoute } from "@angular/router";

import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Deployment } from "../shared/service/deployer/deployment";
import { Observable } from "rxjs";

@Component({
  selector: 'ph-log-monitor',
  templateUrl: './log-monitor.component.html',
  styleUrls: ['./log-monitor.component.css']
})
export class LogMonitorComponent implements OnInit {

  private deployLogs: string;
  private destroyLogs: string;

  logs: string;
  autoScrollDown: boolean = false;
  @Output() logUpdatedEventEmitter = new EventEmitter();

  public deployment: Deployment;
  public downloadLogsUri: SafeUrl;

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private deployerManager: DeployementService) {
  }

  public toggleScrollDown() {
    this.autoScrollDown = !this.autoScrollDown;
    if (this.autoScrollDown)
      this.scrollDown();
  }

  public scrollDown() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  ngOnInit() {
    let combinedLogs: string = "";
    let reference = this.route.snapshot.queryParams['id'];
    this.deployerManager.getDeployment(reference).subscribe(
      (data) => {
        this.deployment = data;
        this.setDeployLogs(this.deployment.deployLogs);
        this.updateLogs(this.deployLogs);
        if (this.deployment.isStarting() || this.deployment.isStartedFailed() || this.deployment.isRunning()) {
          this.deployment.getDeployLogsAsObservable().subscribe((logs) => {
            this.setDeployLogs(this.deployment.deployLogs);
            this.updateLogs(this.deployLogs);
            console.log("Updating logs on start");
          });
        }

        if (this.deployment.isDestroying() || this.deployment.isDestroyed()) {
          this.setDestroyLogs(this.deployment.destroyLogs);
          this.updateLogs(this.deployLogs + this.destroyLogs);
          this.deployment.getDestroyLogsAsObservable().subscribe((logs) => {
            this.setDestroyLogs(logs);
            this.updateLogs(this.deployLogs + this.destroyLogs);
            console.log("Updating logs on remove");
          });
        }
      },
      (error) => {
        console.error(error);
      });
  }

  ngOnDestroy() {
  }

  private prepareForDownload(logs) {
    let blob = new Blob([logs], {type: 'text/plain'});
    let url = window.URL.createObjectURL(blob);
    this.downloadLogsUri = this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private updateLogs(logs) {
    this.logs = logs;
    this.prepareForDownload(logs);
    if (this.autoScrollDown)
      this.scrollDown();
    this.logUpdatedEventEmitter.emit(this.logs);
  }

  private cleanLogs() {
    this.logs = "";
  }

  private static HR = "*".repeat(150);

  private setDeployLogs(logs) {
    this.deployLogs =
      LogMonitorComponent.HR + "\n*** DEPLOY LOGS ***\n"
      + LogMonitorComponent.HR + "\n\n" + logs;
  }

  private setDestroyLogs(logs) {
    this.destroyLogs = "\n\n\n\n"
      + LogMonitorComponent.HR + "\n*** DESTROY LOGS ***\n"
      + LogMonitorComponent.HR + "\n\n" + logs;
  }
}
