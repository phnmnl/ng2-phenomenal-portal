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

  public deployment: Deployment;
  public downloadLogsUri: SafeUrl;

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private deployerManager: DeployerService) {
  }

  public scrollDown(){
    window.scrollTo(0, document.body.scrollHeight);
  }

  ngOnInit() {
    let reference = this.route.snapshot.queryParams['id'];
    console.log("Deployment parameter: ", reference);
    this.deployerManager.getDeployment(reference, true).subscribe(
      (data) => {
        this.deployment = data;
        console.log("Found deployment info", this.deployment);
        this.deployerManager.getDeploymentLogs(reference).subscribe(
          (logs) => {
            this.deployment["logs"] = this.deployerManager.sanitizeLogs(logs);
            let blob = new Blob([this.deployment["logs"]], { type: 'text/plain' });
            let url= window.URL.createObjectURL(blob);
            this.downloadLogsUri = this.sanitizer.bypassSecurityTrustUrl(url);

            if(this.deployment["status"] === "STARTING"){
              this.deployerManager.monitorDeploymentLogs(this.deployment, 1000);
            }

          }, (error) => {
            console.error(error);
          })
      },
      (error) => {
        console.error(error);
      });
  }

  ngOnDestroy() {
  }


}
