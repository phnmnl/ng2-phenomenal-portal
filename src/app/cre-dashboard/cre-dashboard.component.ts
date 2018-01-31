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
import { DeploymentInstance } from "../shared/service/deployer/deploymentInstance";

import { DeployerService } from "../shared/service/deployer/deployer.service";
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
              private deployementManager: DeployerService,
              private cloudCredentialsService: CloudProviderParametersService) {
  }


  ngOnInit() {
    this.deployementManager.getDeployments().subscribe((deployments) => {
      this.deploymentServerList = deployments;
      console.log("Updated deployments", deployments);
    }, (error) => {
      console.error("The current error", error);
      this.userService.logout();
    });
    this.deployementManager.updateDeployments();
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


  destroyDeployment(deployment: DeploymentInstance) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      deployment['show-wheel'] = true;
      modalRef.close();
      setTimeout(() => {
        this._deploymentService.stop(
          this.credentialService.getUsername(), this.tokenService.getToken(),
          <Deployment>{reference: deployment.reference}).subscribe(
          res => {
            console.log('[remove.stop] res %O', res);
            this.getDeploymentStatusFeed(deployment, 3000, (result) => {
              console.log('[remove.stop.feed] res %O', result);
              this.deploymentStatus = result;
              if (result.status === 'DESTROYED' || result.status === 'DESTROYING_FAILED') {
                deployment['show-wheel'] = false;
              }
            });
          });
      }, 2000);
    });
    modalRef.componentInstance.title = "Destroying CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
  }

  public deleteDeployment(deployment: DeploymentInstance) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.title = "Delete CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      deployment['show-wheel'] = true;
      modalRef.close();
      console.log("Removing");
      this._deploymentService.delete(
        this.credentialService.getUsername(), this.tokenService.getToken(), deployment).subscribe(
        res1 => {
          this.deployementManager.getApplication(deployment.applicationName, (app) => {
            if (app.name === deployment.applicationName) {
              this.removeApplication(app,
                (done) => {
                  let counter = 0;
                  for (let d of this.deploymentServerList) {
                    if (d.reference === deployment.reference) {
                      this.deploymentServerList.splice(counter, 1);
                      break;
                    }
                    counter++;
                  }
                  deployment['show-wheel'] = false;
                }, (error) => {
                  deployment.isError = true;
                  deployment['error'] = error;
                  deployment['show-wheel'] = false;
                }
              );
            }
          }, (error) => {
            deployment.isError = true;
            deployment['error'] = error;
            deployment['show-wheel'] = false;
          });
        },
        error => {
          console.log('[Deployments] error %O', error);
          deployment.isError = true;
          deployment['error'] = error;
          deployment['show-wheel'] = false;
        }
      );
    });
  }

  getDeploymentStatusFeed(deploymentInstance: DeploymentInstance, interval: number, callback) {
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
}
