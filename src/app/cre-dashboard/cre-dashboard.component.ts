import { Component, EventEmitter, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  ApplicationService, CloudProviderParametersService,
  CredentialService,
  Deployment,
  DeploymentService,
  DeploymentStatus,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { UserService } from '../shared/service/user/user.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Deployment as PhnDeployment } from "../shared/service/deployer/deployment";

import { DeployementService } from "../shared/service/deployer/deployement.service";
import { ModalDialogContentComponent } from "../shared/component/modal-dialog/modal-dialog.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreDashboardComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;

  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  public galaxy_logo = 'assets/img/logo/galaxy_square.png';
  public luigi_logo = 'assets/img/logo/luigi.png';
  public jupyter_logo = 'assets/img/logo/jupyter_square.png';

  deploymentServerList: Deployment[];
  deploymentStatus: DeploymentStatus;

  private onDestroyEvent = new EventEmitter<PhnDeployment>();
  private onDeleteEvent = new EventEmitter<PhnDeployment>();

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
              private _applicationService: ApplicationService,
              private _deploymentService: DeploymentService,
              private tokenService: TokenService,
              public credentialService: CredentialService,
              public userService: UserService,
              private router: Router,
              private http: Http,
              private deploymentManager: DeployementService,
              private cloudCredentialsService: CloudProviderParametersService) {
  }


  ngOnInit() {
    this.deploymentManager.getDeployments().subscribe((deployments) => {
      this.deploymentServerList = deployments;
      console.log("Updated deployments", deployments);
    }, (error) => {
      console.error("The current error", error);
      this.userService.logout();
    });
    this.deploymentManager.updateDeployments();

    this.onDestroyEvent.subscribe((deployment) => {
      this.processDestroyDeployment(deployment);
    });

    this.onDeleteEvent.subscribe((deployment) => {
      this.processDeleteDeployment(deployment);
    });

  }

  ngOnDestroy() {
  }

  logout() {
    this.tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }

  enabledServices(deployment: Deployment) {
    return deployment && deployment["status"] === "RUNNING"
  }


  destroyDeployment(deployment: PhnDeployment) {
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

  private processDestroyDeployment(deployment: PhnDeployment) {
    deployment['show-wheel'] = true;
    deployment['status'] = 'DESTROYING';
    console.log("Destroying deployment...");
    this._deploymentService.stop(
      this.credentialService.getUsername(), this.tokenService.getToken(),
      <Deployment>{reference: deployment.reference}).subscribe(
      res => {
        console.log('[remove.stop] res %O', res);
      });
    this.getDeploymentStatusFeed(deployment, 3000, (result) => {
      console.log('[remove.stop.feed] res %O', result);
      this.deploymentStatus = result;
      if (result.status === 'DESTROYED' || result.status === 'DESTROYING_FAILED') {
        deployment['show-wheel'] = false;
      }
    });
  }

  public deleteDeployment(deployment: PhnDeployment) {
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

  public processDeleteDeployment(deployment: PhnDeployment) {
    deployment['show-wheel'] = true;
    console.log("Deleting deployment ...");
    this._deploymentService.delete(
      this.credentialService.getUsername(), this.tokenService.getToken(), deployment).subscribe(
      res1 => {
        this.removeDeploymentFromList(deployment);
        if (this.deploymentServerList.length == 0) {
          this.deploymentManager.getApplication(deployment.applicationName, (app) => {
            if (app.name === deployment.applicationName) {
              this.removeApplication(app,
                (done) => {
                  deployment['show-wheel'] = false;
                }, (error) => {
                  deployment.isError = true;
                  deployment['error'] = error;
                  deployment['show-wheel'] = false;
                }
              );
            }
          }, (error) => {
            if (error.status === 404)
              this.removeDeploymentFromList(deployment);
            else {
              deployment.isError = true;
              deployment['error'] = error;
            }
            deployment['show-wheel'] = false;
          });
        } else {
          deployment['show-wheel'] = false;
        }
      },
      error => {
        console.log('[Deployments] error %O', error);
        deployment.isError = true;
        deployment['error'] = error;
        deployment['show-wheel'] = false;
      }
    );
  }

  private removeDeploymentFromList(deployment: PhnDeployment) {
    let counter = 0;
    for (let d of this.deploymentServerList) {
      if (d.reference === deployment.reference) {
        this.deploymentServerList.splice(counter, 1);
        break;
      }
      counter++;
    }
  }

  getDeploymentStatusFeed(deploymentInstance: PhnDeployment, interval: number, callback) {
    const statusFeedSubscription = this._deploymentService.getDeploymentStatusFeed(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
        deploymentInstance.status = res.status;
        deploymentInstance.status_info = res;
        if (res.status === 'DESTROYED') {
          statusFeedSubscription.unsubscribe();
        }
        callback(res);
      },
      error => {
        statusFeedSubscription.unsubscribe();
        callback(error);
      }
    );
  }

  removeApplication(application, onSuccess, onError) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this.tokenService.getToken(), application).subscribe(
      res => {
        console.log('[RepositoryComponent] got response %O', res);
        onSuccess(res);
      },
      error => {
        console.log('[RepositoryComponent] error %O', error);
        onError(error);
      }
    );
  }

  private static clearErrors(deployment: PhnDeployment) {
    deployment.isError = false;
    deployment['error'] = null;
  }
}
