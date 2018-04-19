import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DeploymentInstance } from "../shared/service/deployer/deploymentInstance";
import { DeployerService } from "../shared/service/deployer/deployer.service";
import { ActivatedRoute } from "@angular/router";
import { Deployment } from "ng2-cloud-portal-service-lib";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: 'ph-log-monitor',
  templateUrl: './log-monitor.component.html',
  styleUrls: ['./log-monitor.component.css']
})
export class LogMonitorComponent implements OnInit {

  autoScrollDown: boolean = false;
  public deployment: Deployment;
  public downloadLogsUri: SafeUrl;

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private deployerManager: DeployerService) {
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
    let reference = this.route.snapshot.queryParams['id'];
    this.deployerManager.getDeployment(reference).subscribe(
      (data) => {
        this.deployment = data;
        this.deployerManager.getDeploymentLogs(reference).subscribe(
          (logs) => {
            let blob = new Blob([this.deployment["logs"]], {type: 'text/plain'});
            let url = window.URL.createObjectURL(blob);
            this.downloadLogsUri = this.sanitizer.bypassSecurityTrustUrl(url);
            this.deployment["logs"] = logs;
          }, (error) => {
            console.error(error);
          });
        if (this.deployment["status"] === "STARTING") {
          this.deployerManager.monitorDeploymentLogs(this.deployment, 1000, () => {
            if (this.autoScrollDown)
              this.scrollDown();
          });
        }
      },
      (error) => {
        console.error(error);
      });
  }

  ngOnDestroy() {
  }


}
