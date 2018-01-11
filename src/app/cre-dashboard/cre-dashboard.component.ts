import { Component, OnInit } from '@angular/core';
import {
  ApplicationService,
  CredentialService,
  Deployment,
  DeploymentService,
  DeploymentStatus,
  ErrorService,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { UserService } from '../shared/service/user/user.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css']
})
export class CreDashboardComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';
  deploymentServerList: Deployment[];
  deploymentStatus: DeploymentStatus;
  isDeployment = false;
  isClickedOnce = false;

  get gce_logo(): string {
    return this._gce_logo;
  }

  get openstack_logo(): string {
    return this._openstack_logo;
  }

  get aws_logo(): string {
    return this._aws_logo;
  }

  constructor(private _applicationService: ApplicationService,
              private _deploymentService: DeploymentService,
              private tokenService: TokenService,
              public credentialService: CredentialService,
              public errorService: ErrorService,
              public userService: UserService,
              private router: Router,
              private http: Http) {
  }

  ngOnInit() {
    if (this.tokenService.getToken()) {
      this.getAllApplication((result) => {
        if (result.status === 401 || result.type === 'error') {
          this.logout();
        } else {
          this.getAllDeploymentServerWrapper();
        }
      });
    } else {
      this.logout();
    }
  }

  logout() {
    this.tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }

  getAllDeploymentServerWrapper() {
    this.getAllDeploymentServer(
      (result) => {
        // console.log(result);
        if (result.length === 0) {
          this.router.navigateByUrl('/cloud-research-environment-setup');
        }
        this.isDeployment = true;
        this.deploymentServerList = result;
        for (const deployment of this.deploymentServerList) {
          this.getStatus(deployment, (res) => {
            deployment['status'] = res.status;
            deployment['isDelete'] = false;
            deployment['isMore'] = false;
            deployment['isGalaxy'] = true;
            deployment['isJupyter'] = false;

            for (let i = 0; i < deployment.assignedInputs.length; i++) {

              if (deployment['assignedInputs'][i]['inputName'] === 'cluster_prefix') {
                deployment['galaxyUrlName'] = 'http://galaxy.' + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
              }
              if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_email') {
                deployment['galaxyAdminEmail'] = deployment['assignedInputs'][i]['assignedValue'];
              }
              if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_password') {
                deployment['galaxyAdminPassword'] = deployment['assignedInputs'][i]['assignedValue'];
              }
            }
          });
        }
      }
    );
  }

  getAllDeploymentServer(callback) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      deployment => {
        console.log('[RepositoryComponent] getAll %O', deployment);
        callback(deployment);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }


  getStatus(deployment: Deployment, callback) {

    this._deploymentService.getDeploymentStatus(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      deployment).subscribe(
      res => {
        console.log('[Deployments] got status response %O', res);
        callback(res);
      },
      error => {
        console.log('[Deployments] status error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  remove(deployment: Deployment) {
    this.isClickedOnce = true;
    this.blockUI.start('WARNING: Please wait and check your cloud provider dashboard after the Cloud Research Environment ' +
      'is completely destroyed.');

    console.log('Remove deployment %O', deployment);
    this._deploymentService.stop(this.credentialService.getUsername(), this.tokenService.getToken(),
      deployment).subscribe(
      res => {
        console.log('[remove.stop] res %O', res);
        this.getDeploymentStatusFeed(deployment, 3000, (result) => {
          console.log('[remove.stop.feed] res %O', result);
          this.deploymentStatus = result;
          if (result.status === 'DESTROYED') {

            this._deploymentService.delete(this.credentialService.getUsername(), this.tokenService.getToken(),
              deployment).subscribe(
              res1 => {
                // console.log('deleted');
                this.removeApplication(deployment.applicationName,
                  (done) => {
                    location.reload();
                  },
                );
              },
              error => {
                console.log('[Deployments] error %O', error);
                this.errorService.setCurrentError(error);
              }
            );
          }
        });
      },
      error => {
        console.log('[Deployments] error %O', error);
        this.errorService.setCurrentError(error);
      }
    );
  }

  getDeploymentStatusFeed(deploymentInstance: Deployment, interval: number, callback) {
    const statusFeedSubscription = this._deploymentService.getDeploymentStatusFeed(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
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

  removeApplication(applicationName, callback) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this.tokenService.getToken(), applicationName).subscribe(
      res => {
        console.log('[RepositoryComponent] got response %O', res);
        callback(res);
      },
      error => {
        console.log('[RepositoryComponent] error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  getAllApplication(callback) {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      app => {
        callback(app);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        callback(error);
      }
    );
  }
}
