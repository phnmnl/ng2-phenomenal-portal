import { Component, EventEmitter, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  CredentialService,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from '../shared/service/user/user.service';
import { Deployment } from "../shared/service/deployer/deployment";
import { CanComponentDeactivate } from "../shared/guard/CanDeactivateGuard";
import { DeployementService } from "../shared/service/deployer/deployement.service";
import { ModalDialogContentComponent } from "../shared/component/modal-dialog/modal-dialog.component";
import { Observable } from "rxjs";

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreDashboardComponent extends CanComponentDeactivate implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;

  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  public galaxy_logo = 'assets/img/logo/galaxy_square.png';
  public luigi_logo = 'assets/img/logo/luigi.png';
  public jupyter_logo = 'assets/img/logo/jupyter_square.png';

  public error_icon = 'assets/img/error-icon.png';

  deploymentServerList: Deployment[];

  private onDestroyEvent = new EventEmitter<Deployment>();
  private onDeleteEvent = new EventEmitter<Deployment>();

  get gce_logo(): string {
    return this._gce_logo;
  }

  get openstack_logo(): string {
    return this._openstack_logo;
  }

  get aws_logo(): string {
    return this._aws_logo;
  }


  constructor(private modalService: NgbModal,
              private tokenService: TokenService,
              public credentialService: CredentialService,
              public userService: UserService,
              private router: Router,
              private deploymentManager: DeployementService) {
    super();
  }

  ngOnInit() {
    this.deploymentManager.getDeployments().subscribe((deployments) => {
      this.deploymentServerList = deployments;
      console.log("Updated deployments", deployments);
    }, (error) => {
      console.error("The current error", error);
      this.userService.logout();
    });

    this.onDestroyEvent.subscribe((deployment) => {
      this.processDestroyDeployment(deployment);
    });

    this.onDeleteEvent.subscribe((deployment) => {
      this.processDeleteDeployment(deployment);
    });

    this.deploymentManager.updateDeployments();
  }

  ngOnDestroy() {
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    console.log("Checking if it can be unloaded");
    for(let d of this.deploymentServerList){
      if(d.isStarting()){
        let status = d.statusTransition;
        if(status){
          console.log(status);
          if(status.stepNumber < 9) {
            console.warn("You cannot deactivate the current window");
            return false;
          }
        }
      }
    }
    console.log("the current window can be deactivated!");
    return true;
  }

  logout() {
    this.tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }

  enabledServices(deployment: Deployment) {
    return deployment && deployment["status"] === "RUNNING"
  }


  destroyDeployment(deployment: Deployment) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      CreDashboardComponent.clearErrors(deployment);
      this.onDestroyEvent.emit(deployment);
      modalRef.close();
    });
    modalRef.componentInstance.title = "Stop CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
  }

  private processDestroyDeployment(deployment: Deployment) {
    console.log("Destroying deployment...");
    this.deploymentManager.destroyDeployment(deployment);
  }

  public deleteDeployment(deployment: Deployment) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.title = "Delete CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      CreDashboardComponent.clearErrors(deployment);
      modalRef.close();
      this.onDeleteEvent.emit(deployment);
    });
  }

  public processDeleteDeployment(deployment: Deployment) {
    console.log("Deleting deployment ...");
    this.deploymentManager.deleteDeploymentConfiguration(deployment);
  }

  private static clearErrors(deployment: Deployment) {
    deployment.cleanErrors();
  }
}
