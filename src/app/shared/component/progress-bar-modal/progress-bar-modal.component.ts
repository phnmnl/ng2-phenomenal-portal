import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ApplicationDeployer } from 'ng2-cloud-portal-presentation-lib';
import {DeploymentService, Deployment, CloudProviderParameters, AccountService} from 'ng2-cloud-portal-service-lib';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { ErrorService } from 'ng2-cloud-portal-service-lib';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { ApplicationService, CloudProviderParametersService} from 'ng2-cloud-portal-service-lib';
import {isError} from 'util';
import {Credential } from '../../../setup/credential';
import {CloudProvider} from '../../../setup/cloud-provider';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'ph-progress-bar-modal-content',
  template: `
<div style="text-align: center">
  <div class="modal-header">
    <h4 class="modal-title text-center">Cloud Research Environment Installation</h4>
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
    <a type="button" class="btn btn-primary" href="/cloud-research-environment">Installation Complete</a>
  </div>
  <div *ngIf="isError">
    <a type="button" class="btn btn-primary" href="/cloud-research-environment">Cancel</a>
  </div>
</div>
  `
})

export class ProgressBarModalContentComponent implements OnInit, OnDestroy {
  @Input() credential: Credential;
  @Input() cloudProvider: CloudProvider;

  progress = 0;
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
  id;
  applicationDeployer: ApplicationDeployer;
  isError = false;
  isRunning = 0;
  name;
  selectedCloudProvider: CloudProviderParameters;
  repoUrl;
  username;
  isExist = false;

  constructor(public activeModal: NgbActiveModal,
              private _applicationService: ApplicationService,
              private _cloudCredentialsService: CloudProviderParametersService,
              private _deploymentService: DeploymentService,
              private _tokenService: TokenService,
              public credentialService: CredentialService,
              public errorService: ErrorService,
              public _accountService: AccountService,
              private config: AppConfig
  ) {
    this.repoUrl = config.getConfig('deployment_repo_url');
  }

  ngOnInit(

  ) {
    this._accountService.getAccount(this.credentialService.getUsername(), this._tokenService.getToken()).subscribe(
      account => {
        this.name = 'ph' + this.generateUIDNotMoreThan1million();

        this.username = account.userName;

        let value;

        if (this.credential.provider === 'AWS') {
          this.applicationDeployer = <ApplicationDeployer> {
            name: 'Phenomenal VRE',
            accountUsername: this.username,
            repoUri: this.repoUrl,
            selectedCloudProvider: 'AWS' };
          this.applicationDeployer.attachedVolumes = {};
          this.applicationDeployer.assignedInputs = {
            cluster_prefix: this.name,
            aws_access_key_id: this.credential.access_key_id,
            aws_secret_access_key: this.credential.secret_access_key,
            aws_region: this.credential.default_region,
            availability_zone: this.credential.default_region + 'a',
            master_as_edge: 'true',
            master_instance_type: 't2.xlarge',
            node_count: '2',
            node_instance_type: 't2.xlarge',
            glusternode_count: '1',
            glusternode_instance_type: 't2.xlarge',
            glusternode_extra_disk_size: '100',
            phenomenal_pvc_size: '95Gi',
            galaxy_admin_email: this.credential.galaxy_admin_email,
            galaxy_admin_password: this.credential.galaxy_admin_password,
            jupyter_password: this.credential.galaxy_admin_password,
            dashboard_username: this.credential.galaxy_admin_email,
            dashboard_password: this.credential.galaxy_admin_password
          };
          this.applicationDeployer.assignedParameters = {};
          this.applicationDeployer.configurations = [];
          this.selectedCloudProvider = {
            name: this.name + '-' + this.credential.provider,
            accountUsername: this.username,
            cloudProvider: 'AWS',
            fields: [
              {'key': 'AWS_ACCESS_KEY_ID', 'value': this.credential.access_key_id},
              {'key': 'AWS_SECRET_ACCESS_KEY', 'value': this.credential.secret_access_key},
              {'key': 'AWS_DEFAULT_REGION', 'value': this.credential.default_region}
            ],
            sharedWithAccountEmails: [],
            sharedWithTeamNames: []
          }
          value = {
            'name': this.name + '-' + this.credential.provider,
            'cloudProvider': this.credential.provider,
            'fields': [
              {'key': 'AWS_ACCESS_KEY_ID', 'value': this.credential.access_key_id},
              {'key': 'AWS_SECRET_ACCESS_KEY', 'value': this.credential.secret_access_key},
              {'key': 'AWS_DEFAULT_REGION', 'value': this.credential.default_region}
            ]
          };
        } else if (this.credential.provider === 'GCP') {
          this.applicationDeployer = <ApplicationDeployer> {
            name: 'Phenomenal VRE',
            accountUsername: this.username,
            repoUri: this.repoUrl,
            selectedCloudProvider: 'GCP' };
          this.applicationDeployer.attachedVolumes = {};
          this.applicationDeployer.assignedInputs = {
            cluster_prefix: this.name,
            gce_project: this.credential.tenant_name,
            gce_zone: this.credential.default_region,
            master_as_edge: 'true',
            master_flavor: 'n1-standard-2',
            node_count: '2',
            node_flavor: 'n1-standard-2',
            glusternode_count: '1',
            glusternode_flavor: 'n1-standard-2',
            glusternode_extra_disk_size: '100',
            phenomenal_pvc_size: '95Gi',
            galaxy_admin_email: this.credential.galaxy_admin_email,
            galaxy_admin_password: this.credential.galaxy_admin_password,
            jupyter_password: this.credential.galaxy_admin_password,
            dashboard_username: this.credential.galaxy_admin_email,
            dashboard_password: this.credential.galaxy_admin_password
          };
          this.applicationDeployer.assignedParameters = {};
          this.applicationDeployer.configurations = [];
          this.selectedCloudProvider = {
            name: this.name + '-' + this.credential.provider,
            accountUsername: this.username,
            cloudProvider: 'GCP',
            fields: [
              {'key': 'GOOGLE_CREDENTIALS', 'value': this.credential.access_key_id.replace(/\\n/g, '\\n')},
              {'key': 'GCE_PROJECT', 'value': this.credential.tenant_name},
              {'key': 'GCE_ZONE', 'value': this.credential.default_region}
            ],
            sharedWithAccountEmails: [],
            sharedWithTeamNames: []
          }
          value = {
            'name': this.name + '-' + this.credential.provider,
            'cloudProvider': this.credential.provider,
            'fields': [
              {'key': 'GOOGLE_CREDENTIALS', 'value': this.credential.access_key_id.replace(/\\n/g, '\\n')},
              {'key': 'GCE_PROJECT', 'value': this.credential.tenant_name},
              {'key': 'GCE_ZONE', 'value': this.credential.default_region}
            ]
          };
        } else {
          this.applicationDeployer = <ApplicationDeployer> {
            name: 'Phenomenal VRE',
            accountUsername: this.username,
            repoUri: this.repoUrl,
            selectedCloudProvider: 'OSTACK' };
          this.applicationDeployer.attachedVolumes = {};
          this.applicationDeployer.assignedInputs = {
            cluster_prefix: this.name,
            floating_ip_pool: this.credential.ip_pool,
            external_network_uuid: this.credential.network,
            master_as_edge: 'true',
            master_flavor: this.credential.flavor,
            node_count: '2',
            node_flavor: this.credential.flavor,
            glusternode_count: '1',
            glusternode_flavor: this.credential.flavor,
            glusternode_extra_disk_size: '100',
            phenomenal_pvc_size: '95Gi',
            galaxy_admin_email: this.credential.galaxy_admin_email,
            galaxy_admin_password: this.credential.galaxy_admin_password,
            jupyter_password: this.credential.galaxy_admin_password,
            dashboard_username: this.credential.galaxy_admin_email,
            dashboard_password: this.credential.galaxy_admin_password
          };
          this.applicationDeployer.assignedParameters = {};
          this.applicationDeployer.configurations = [];
          this.selectedCloudProvider = {
            name: this.name + '-' + this.credential.provider,
            accountUsername: this.username,
            cloudProvider: 'OSTACK',
            fields: [
              {'key': 'OS_USERNAME', 'value': this.credential.username},
              {'key': 'OS_TENANT_NAME', 'value': this.credential.tenant_name},
              {'key': 'OS_AUTH_URL', 'value': this.credential.url},
              {'key': 'OS_PASSWORD', 'value': this.credential.password},
              {'key': 'OS_PROJECT_NAME', 'value': this.credential.tenant_name}
            ],
            sharedWithAccountEmails: [],
            sharedWithTeamNames: []
          }
          value = {
            'name': this.name + '-' + this.credential.provider,
            'cloudProvider': this.credential.provider,
            'fields': [
              {'key': 'OS_USERNAME', 'value': this.credential.username},
              {'key': 'OS_TENANT_NAME', 'value': this.credential.tenant_name},
              {'key': 'OS_AUTH_URL', 'value': this.credential.url},
              {'key': 'OS_PASSWORD', 'value': this.credential.password},
              {'key': 'OS_PROJECT_NAME', 'value': this.credential.tenant_name}
            ]
          };
        }

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
      },
      error => {
        console.log(error);
      }
    );


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

            for (let i = 0; i < appStatus.length; i++) {
              console.log('name ' + appStatus[i]['name']);
              if (appStatus[i]['name'] === 'Phenomenal VRE') {
                this.isExist = true;
                console.log('exist');
                break;
              }
            }

            if (appStatus.status === 401 || appStatus.status === 404 ) {
              console.log(appStatus.message);
              this.status[this.progress / 10 ] = 'ERROR: ' + appStatus.message;
              this.isError = true;
            } else  if (!this.isExist) {
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
              this.increment(
                setTimeout(() => {
                  this.addDeployment(callback);
                }, 2000));
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
    console.log('[ProgressBar] Adding deployment for application from '
      + applicationDeployer.repoUri + ' into '
      + applicationDeployer.selectedCloudProvider + ' surname ' + this.credentialService.getUsername());
    this._deploymentService.add(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      applicationDeployer,
      this.selectedCloudProvider,
      applicationDeployer.attachedVolumes,
      applicationDeployer.assignedInputs,
      applicationDeployer.assignedParameters,
      applicationDeployer.configurations
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

  generateUIDNotMoreThan1million() {
    return ('000000' + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
  }
}

@Component({
  selector: 'ph-progress-bar-modal',
  templateUrl: './progress-bar-modal.component.html',
  styleUrls: ['./progress-bar-modal.component.css']
})
export class ProgressBarModalComponent {
  @Input() credential: Credential;
  @Input() cloudProvider: CloudProvider;

  constructor(private modalService: NgbModal) {}

  open() {
    const modalRef = this.modalService.open(ProgressBarModalContentComponent, { size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.credential = this.credential;
    modalRef.componentInstance.cloudProvider = this.cloudProvider;
  }
}
