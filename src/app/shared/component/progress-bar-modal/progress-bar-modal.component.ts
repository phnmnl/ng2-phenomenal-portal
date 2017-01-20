import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ApplicationDeployer } from 'ng2-cloud-portal-presentation-lib';
import {DeploymentService, Deployment} from 'ng2-cloud-portal-service-lib';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { ErrorService } from 'ng2-cloud-portal-service-lib';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { ApplicationService, CloudCredentialsService} from 'ng2-cloud-portal-service-lib';
import {isError} from 'util';
import {Credential } from '../../../setup/credential';

@Component({
  selector: 'ph-progress-bar-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Cloud Research Environment Installation</h4>
    </div>
    <div class="modal-body">
      <ph-progress-bar [progress]="progress"></ph-progress-bar>
    </div>
    <div *ngIf="progress <= 100">
      <div *ngIf="!isError">
        <b><p>{{status[progress/10]}}</p></b>
      </div>
      <div *ngIf="isError">
        <b><p style="color:red">{{status[progress/10]}}</p></b>
      </div>
    </div>
    <div *ngIf="progress > 100">
      <a type="button" class="btn btn-primary" [routerLink]="['/cloud-research-environment']">Installation Complete</a>
    </div>
    <div *ngIf="isError">
      <a type="button" class="btn btn-primary" (click)="activeModal.close('Close click')">Cancel</a>
    </div>
  `
})

export class ProgressBarModalContentComponent implements OnInit, OnDestroy {
  @Input() credential: Credential;

  progress: number = 0;
  status: string[] = [
    'Initialising ...',
    'Applying Cloud Credentials ...',
    'Checking the Application ...',
    'Setting up the Application ...',
    'Adding Deployment Server ...',
    'Setting up Deployment Server ...',
    'Starting Deployment Server ...',
    'Running Deployment Server ...',
    'Setting up Cloud Research Environment ...',
    'Running Cloud Research Environment ...',
    'Cloud Research Environment is Ready for Use!',
  ];
  id;
  applicationDeployer: ApplicationDeployer;
  isError = false;
  isRunning = 0;

  constructor(public activeModal: NgbActiveModal,
              private _applicationService: ApplicationService,
              private _cloudCredentialsService: CloudCredentialsService,
              private _deploymentService: DeploymentService,
              private _tokenService: TokenService,
              public credentialService: CredentialService,
              public errorService: ErrorService
  ) {
  }

  ngOnInit() {
    // this.applicationDeployer = <ApplicationDeployer> {
    //   name: 'BioExcel Portal test application',
    //   repoUri: 'https://github.com/sh107/be-application-test',
    //   selectedCloudProvider: 'OSTACK' };
    // this.applicationDeployer.attachedVolumes = {};
    // this.applicationDeployer.assignedInputs = {};
    this.applicationDeployer = <ApplicationDeployer> {
      name: 'KubeNow application',
      repoUri: 'https://github.com/phnmnl/kubenow-image-application.git',
      selectedCloudProvider: 'OSTACK' };
    this.applicationDeployer.attachedVolumes = {};
    this.applicationDeployer.assignedInputs = {};

    const value = {
      'name': this.credential.username + '-' + this.credential.provider,
      'cloudProvider': this.credential.provider,
      'fields': [
        {'key': 'OS_USERNAME', 'value': this.credential.username},
        {'key': 'OS_TENANT_NAME', 'value': this.credential.tenant_name},
        {'key': 'OS_AUTH_URL', 'value': this.credential.url},
        {'key': 'OS_PASSWORD', 'value': this.credential.password}
      ]
    };
    setTimeout((callback) => {
      this.increment(
        setTimeout(() => {
          this.getAllCloudCredential((back) => {
            let isExist = false;
            for (let v = 0; v < back.length; v++) {
              if (back[v].name === value.name) {
                isExist = true;
                break;
              }
            }
            if (isExist) {
              this.addApp(callback);
            } else {

              this.addCloudCredential(value,
                (status) => {
                  if (status.status === 401 ) {
                    console.log(status.message);
                    this.status[this.progress / 10 ] = 'ERROR: ' + status.message;
                    this.isError = true;
                  } else {
                    this.addApp(callback);
                  }
                }
              );
            }

          });
        }, 2000)
      );
    }, 2000);
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  increment(callback) {
    this.progress += 10;
  }

  addApp(callback) {
    setTimeout(() => {
      this.increment(setTimeout(() => {
        this.getAllApplication(
          (appStatus) => {
            console.log(appStatus);
            if (appStatus.status === 401 || appStatus.status === 404 ) {
              console.log(appStatus.message);
              this.status[this.progress / 10 ] = 'ERROR: ' + appStatus.message;
              this.isError = true;
            } else  if (appStatus.length === 0) {
              setTimeout(() => {
                this.increment(
                  setTimeout(() => {
                    this.addApplication(
                      this.applicationDeployer,
                      (addAppStatus) => {
                        if (addAppStatus.status === 401 || addAppStatus.status === 404 ) {
                          console.log(addAppStatus.message);
                          this.status[this.progress / 10 ] = 'ERROR: ' + addAppStatus.message;
                          this.isError = true;
                        } else {
                          this.addDeployment(callback);
                        }
                      }
                    );
                  }, 2000));
              }, 2000);
            } else {
              // console.log('remove app');
              // this.removeApplication(this.applicationDeployer, (res) => {
              //
              // });
              this.addDeployment(callback);
            }
          }
        );
      }, 2000));
    }, 2000);
  }

  addDeployment(callback) {
    setTimeout(() => {
      this.increment(
        this.increment(setTimeout( () => {
          this.createDeploymentServer(
            this.applicationDeployer,
            (deployStatus) => {
              if (deployStatus.status === 401 || deployStatus.status === 404 ) {
                console.log(deployStatus.message);
                this.status[this.progress / 10 ] = 'ERROR: ' + deployStatus.message;
                this.isError = true;
              } else {
                let isStarted: boolean;
                isStarted = true;

                setTimeout(() => {
                  this.increment(setTimeout(
                    () => {
                      console.log(deployStatus);
                      this.getDeploymentStatusFeed(deployStatus, 3000, (result) => {
                        console.log(result);

                        if (result.status === 'STARTING_FAILED') {
                          this.status[this.progress / 10 ] = 'ERROR: ' + result.status;
                          this.isError = true;
                        }
                        if (result.status === 'STARTING' && isStarted) {
                          isStarted = false;
                          this.increment(() => {
                          });
                        }

                        if (result.status === 'RUNNING') {
                          this.increment(() => {
                          });
                        }
                      });
                    }, 2000)
                  );
                }, 2000);
              }
            }
          );
        }, 2000))
      );
    }, 2000);
  }

  getDeploymentStatusFeed(deploymentInstance: Deployment, interval: number, callback) {
    const statusFeedSubscription = this._deploymentService.getDeploymentStatusFeed(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
        if (res.status === 'STARTING_FAILED') {
            statusFeedSubscription.unsubscribe();
        }
        if (res.status === 'RUNNING') {
          this.isRunning++;
          if (this.isRunning >= 5) {
            statusFeedSubscription.unsubscribe();
          }
        }
        callback(res);
      },
      error => {
        statusFeedSubscription.unsubscribe();
        callback(error);
      }
    );
  }

  addCloudCredential(value: any, callback) {
    console.log('[Profile] adding ' + value.name);
    // value.fields = JSON.parse(value.fields);

    this._cloudCredentialsService.add(this._tokenService.getToken(), value)
      .subscribe(
        cloudCredentials  => {
          console.log('[Profile] got response %O', cloudCredentials);
          callback(cloudCredentials);
        },
        error => {
          console.log('[Profile] error %O', error);
          this.errorService.setCurrentError(error);
          callback(error);
        }
      );
  }

  getAllCloudCredential(callback) {
    this._cloudCredentialsService.getAll(this.credentialService.getUsername(),
      this._tokenService.getToken())
      .subscribe(
        cloudCredentials => {
          console.log('[Profile] CloudCredentials data is %O', cloudCredentials);
          callback(cloudCredentials);
        },
        error => {
          console.log('[Profile] error %O', error);
          this.errorService.setCurrentError(error);
          callback(error);
        }
      );
  }

  removeCloudCredentials(value: any, callback) {
    console.log('[Profile] removing cloud credentials ' + value.name);
    this._cloudCredentialsService.delete(
      this._tokenService.getToken(), value).subscribe(
      res => {
        console.log('[Profile] got response %O', res);
        callback(res);
      },
      error => {
        console.log('[Profile] error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  getAllApplication(callback) {
    this._applicationService.getAll(this.credentialService.getUsername(),
      this._tokenService.getToken())
      .subscribe(
        applications => {
          console.log('[RepositoryComponent] Applications data is %O', applications);
          callback(applications);
        },
        error => {
          console.log('[RepositoryComponent] error %O', error);
          this.errorService.setCurrentError(error);
          callback(error);
        }
      );
  }

  addApplication(value: any, callback) {
    console.log('[RepositoryComponent] adding ' + value.repoUri);
    const repoUri = value.repoUri;
    this._applicationService.add(this.credentialService.getUsername(),
      this._tokenService.getToken(), repoUri)
      .subscribe(
        application  => {
          console.log('[RepositoryComponent] got response %O', application);
          callback(application);
        },
        error => {
          console.log('[RepositoryComponent] error %O', error);
          this.errorService.setCurrentError(error);
          callback(error);
        }
      );
  }

  createDeploymentServer(applicationDeployer: ApplicationDeployer, callback) {

    applicationDeployer.deploying = true;
    console.log('[RepositoryComponent] Adding deployment for application from '
      + applicationDeployer.repoUri + ' into '
      + applicationDeployer.selectedCloudProvider);
    this._deploymentService.add(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      applicationDeployer,
      applicationDeployer.selectedCloudProvider,
      applicationDeployer.attachedVolumes,
      applicationDeployer.assignedInputs
    ).subscribe(
      deployment  => {
        console.log('[RepositoryComponent] deployed %O', deployment);
        callback(deployment);
      },
      error => {
        console.log('[RepositoryComponent] error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  getAllDeploymentServer(callback) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()
    ).subscribe(
      deployment  => {
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

  removeApplication(applicationDeployer: ApplicationDeployer, callback) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this._tokenService.getToken(), applicationDeployer).subscribe(
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
}

@Component({
  selector: 'ph-progress-bar-modal',
  templateUrl: './progress-bar-modal.component.html',
  styleUrls: ['./progress-bar-modal.component.css']
})
export class ProgressBarModalComponent {
  @Input() credential: Credential;

  constructor(private modalService: NgbModal) {}

  open() {
    const modalRef = this.modalService.open(ProgressBarModalContentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.credential = this.credential;
  }
}
