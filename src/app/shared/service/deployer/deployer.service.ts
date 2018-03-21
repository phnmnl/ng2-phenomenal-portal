import { Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  AccountService, Application,
  ApplicationService,
  CloudProviderParameters,
  CloudProviderParametersService,
  Configuration,
  ConfigurationDeploymentParameters,
  ConfigurationService,
  CredentialService,
  Deployment,
  DeploymentService,
  TokenService
} from "ng2-cloud-portal-service-lib";
import { AppConfig } from "../../../app.config";
import { Credential } from "../../../setup/credential";

import { Subject } from "rxjs/Subject";
import { Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { DeploymentConfiguration } from "./deployementConfiguration";
import { DeploymentInstance as CreDeployment } from "./deploymentInstance";
import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";


@Injectable()
export class DeployerService implements OnInit, OnDestroy {

  private readonly repoUrl;
  private readonly use_https: boolean;

  private lastLoadedDeploymentList: Deployment[];
  private observableDeploymentList = new Subject<Deployment[]>();

  constructor(private _applicationService: ApplicationService,
              private _cloudCredentialsService: CloudProviderParametersService,
              private _deploymentService: DeploymentService,
              private _tokenService: TokenService,
              public credentialService: CredentialService,
              public _accountService: AccountService,
              public configurationService: ConfigurationService,
              private config: AppConfig) {
    this.repoUrl = config.getConfig('deployment_repo_url');
    this.use_https = config.getConfig('enable_https');
    this.updateDeployments();
  }

  ngOnInit() {
    this.updateDeployments();
  }

  ngOnDestroy() {
  }

  public updateDeployments(reload: boolean = false) {
    if (reload || !this.lastLoadedDeploymentList) {
      this.loadDeployments(true).subscribe(
        (deployments) => {
          this.observableDeploymentList.next(deployments);
        },
        (error) => {
          console.error(error);
        });
    } else {
      this.observableDeploymentList.next(this.lastLoadedDeploymentList);
    }
  }

  public getDeployment(reference: string, status: boolean = false): Observable<CreDeployment> {
    return this._deploymentService.get(
      this.credentialService.getUsername(), this._tokenService.getToken(),
      <Deployment>{reference: reference}
    ).map((deployment) => {
      if (status) {
        this._deploymentService.getDeploymentStatus(
          this.credentialService.getUsername(), this._tokenService.getToken(),
          deployment
        ).subscribe((res) => {
          deployment['status'] = res.status;
          deployment['status_info'] = res;
        }, (error) => {
          console.error(error);
        });
      }
      return deployment;
    }).catch(this.handleError);
  }

  public getDeployments(): Observable<Deployment[]> {
    return this.observableDeploymentList.asObservable();
  }


  public loadDeployments(status: boolean = false, logs: boolean = false): Observable<Deployment[]> {
    return this._deploymentService.getAll(
      this.credentialService.getUsername(), this._tokenService.getToken()
    ).map(deploymentList => {
      let result: Deployment[] = [];
      for (const deploymentRef of deploymentList) {
        this.getDeployment(deploymentRef.reference).subscribe((deployment: CreDeployment) => {

          // add configuration object
          deployment.configuration = <DeploymentConfiguration>{
            provider: deployment.cloudProviderParametersCopy
          };

          if (logs) {
            this._deploymentService.getDeploymentLogs(
              this.credentialService.getUsername(), this._tokenService.getToken(),
              deployment
            ).subscribe((log) => {
              deployment['logs'] = log;
            }, (error) => {
              console.error(error);
            });
          }

          if (status) {
            this._deploymentService.getDeploymentStatus(
              this.credentialService.getUsername(), this._tokenService.getToken(),
              deployment
            ).subscribe((res) => {
              deployment['status'] = res.status;
              deployment.status_info = res;
              if (res.status === "STARTING" || res.status === "DESTROYING") {
                deployment.progress = 70;
                deployment.isInstalling = true;
                deployment.isRunning = 0;
                this.registerStatusFeed(deployment, 3000);
              } else if (res.status === "RUNNING") {
                deployment.progress = 100;
              }
            }, (error) => {
              console.error(error);
            });
          }
          // configure service properties
          this.setSerivcesinfo(deployment);
          // add the deployment to the list
          result.push(deployment);
        }, error => {
          console.error(error);
        });
      }
      this.lastLoadedDeploymentList = result;
      return result;
    }).catch(this.handleError);
  }

  private setSerivcesinfo(deployment: CreDeployment) {
    for (let i = 0; i < deployment.assignedInputs.length; i++) {
      let separator = this.use_https ? "-" : ".";
      let protocol = this.use_https ? "https://" : "http://";
      if (deployment['assignedInputs'][i]['inputName'] === 'cluster_prefix') {
        deployment['galaxyUrl'] = protocol + 'galaxy' + separator + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
        deployment['luigiUrl'] = protocol + 'luigi' +separator + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
        deployment['jupyterUrl'] = protocol + 'notebook' + separator  + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
      }
      if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_email') {
        deployment['galaxyAdminEmail'] = deployment['assignedInputs'][i]['assignedValue'];
      }
      if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_password') {
        deployment['galaxyAdminPassword'] = deployment['assignedInputs'][i]['assignedValue'];
      }
    }
  }

  create(credential: Credential): CreDeployment {
    // TODO: fix the username
    credential.username = this.credentialService.getUsername();
    let deployment = this.configDeploymentInstance(credential);
    deployment.deployer = this;
    return deployment;
  }

  public deploy(deploymentInstance: CreDeployment) {
    let value;
    let applicationDeployer;
    let username = this.credentialService.getUsername();
    let selectedCloudProvider;
    let credential = deploymentInstance.configuration.credential;

    let name = this.generateName();

    if (credential.provider === 'AWS') {
      applicationDeployer = <ApplicationDeployer> {
        name: 'Phenomenal VRE',
        accountUsername: username,
        repoUri: this.repoUrl,
        selectedCloudProvider: 'AWS'
      };
      applicationDeployer.attachedVolumes = {};
      applicationDeployer.assignedInputs = {
        cluster_prefix: name,
        // aws_access_key_id: credential.access_key_id,
        // aws_secret_access_key: credential.secret_access_key,
        // aws_region: credential.default_region,
        availability_zone: credential.default_region + 'b',
        master_as_edge: 'true',
        master_instance_type: 't2.xlarge',
        node_count: '2',
        node_instance_type: 't2.xlarge',
        glusternode_count: '1',
        glusternode_instance_type: 't2.xlarge',
        glusternode_extra_disk_size: '100',
        phenomenal_pvc_size: '90Gi',
        galaxy_admin_email: credential.galaxy_admin_email,
        galaxy_admin_password: credential.galaxy_admin_password,
      };
      applicationDeployer.assignedParameters = {};
      applicationDeployer.configurations = [];
      selectedCloudProvider = {
        name: name + '-' + credential.provider,
        accountUsername: username,
        cloudProvider: 'AWS',
        fields: [
          {'key': 'TF_VAR_aws_access_key_id', 'value': credential.access_key_id},
          {'key': 'TF_VAR_aws_secret_access_key', 'value': credential.secret_access_key},
          {'key': 'TF_VAR_aws_region', 'value': credential.default_region},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ],
        sharedWithAccountEmails: [],
        sharedWithTeamNames: [],
        reference: ''
      };
      value = {
        'name': name + '-' + credential.provider,
        'cloudProvider': credential.provider,
        'fields': [
          {'key': 'TF_VAR_aws_access_key_id', 'value': credential.access_key_id},
          {'key': 'TF_VAR_aws_secret_access_key', 'value': credential.secret_access_key},
          {'key': 'TF_VAR_aws_region', 'value': credential.default_region},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ]
      };
    } else if (credential.provider === 'GCP') {
      applicationDeployer = <ApplicationDeployer> {
        name: 'Phenomenal VRE',
        accountUsername: username,
        repoUri: this.repoUrl,
        selectedCloudProvider: 'GCP'
      };
      applicationDeployer.attachedVolumes = {};
      applicationDeployer.assignedInputs = {
        cluster_prefix: name,
        gce_project: credential.tenant_name,
        gce_zone: credential.default_region,
        master_as_edge: 'true',
        master_flavor: 'n1-standard-2',
        node_count: '2',
        node_flavor: 'n1-standard-2',
        glusternode_count: '1',
        glusternode_flavor: 'n1-standard-2',
        glusternode_extra_disk_size: '100',
        phenomenal_pvc_size: '90Gi',
        galaxy_admin_email: credential.galaxy_admin_email,
        galaxy_admin_password: credential.galaxy_admin_password
        // jupyter_password: credential.galaxy_admin_password,
        // dashboard_username: credential.galaxy_admin_email,
        // dashboard_password: credential.galaxy_admin_password
      };
      applicationDeployer.assignedParameters = {};
      applicationDeployer.configurations = [];
      selectedCloudProvider = {
        name: name + '-' + credential.provider,
        accountUsername: username,
        cloudProvider: 'GCP',
        fields: [
          {'key': 'GOOGLE_CREDENTIALS', 'value': credential.access_key_id.replace(/\\n/g, '\\n')},
          {'key': 'GCE_PROJECT', 'value': credential.tenant_name},
          {'key': 'GCE_ZONE', 'value': credential.default_region},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ],
        sharedWithAccountEmails: [],
        sharedWithTeamNames: [],
        reference: ''
      };
      value = {
        'name': name + '-' + credential.provider,
        'cloudProvider': credential.provider,
        'fields': [
          {'key': 'GOOGLE_CREDENTIALS', 'value': credential.access_key_id.replace(/\\n/g, '\\n')},
          {'key': 'GCE_PROJECT', 'value': credential.tenant_name},
          {'key': 'GCE_ZONE', 'value': credential.default_region},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ]
      };
    } else {
      applicationDeployer = <ApplicationDeployer> {
        name: 'Phenomenal VRE',
        accountUsername: username,
        repoUri: this.repoUrl,
        selectedCloudProvider: 'OSTACK'
      };
      applicationDeployer.attachedVolumes = {};
      applicationDeployer.assignedInputs = {
        cluster_prefix: name,
        floating_ip_pool: credential.ip_pool,
        external_network_uuid: credential.network,
        master_as_edge: 'true',
        master_flavor: credential.flavor,
        node_count: '2',
        node_flavor: credential.flavor,
        glusternode_count: '1',
        glusternode_flavor: credential.flavor,
        glusternode_extra_disk_size: '100',
        phenomenal_pvc_size: '90Gi',
        galaxy_admin_email: credential.galaxy_admin_email,
        galaxy_admin_password: credential.galaxy_admin_password
        // jupyter_password: credential.galaxy_admin_password,
        // dashboard_username: credential.galaxy_admin_email,
        // dashboard_password: credential.galaxy_admin_password
      };
      applicationDeployer.assignedParameters = {};
      applicationDeployer.configurations = [];
      selectedCloudProvider = {
        name: name + '-' + credential.provider,
        accountUsername: username,
        cloudProvider: 'OSTACK',
        fields: [
          {'key': 'OS_USERNAME', 'value': credential.username},
          {'key': 'OS_TENANT_NAME', 'value': credential.tenant_name},
          {'key': 'OS_AUTH_URL', 'value': credential.url},
          {'key': 'OS_PASSWORD', 'value': credential.password},
          {'key': 'OS_PROJECT_NAME', 'value': credential.tenant_name},
          {'key': 'OS_RC_FILE', 'value': btoa(credential.rc_file)},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ],
        sharedWithAccountEmails: [],
        sharedWithTeamNames: [],
        reference: ''
      };
      value = {
        'name': name + '-' + credential.provider,
        'cloudProvider': credential.provider,
        'fields': [
          {'key': 'OS_USERNAME', 'value': credential.username},
          {'key': 'OS_TENANT_NAME', 'value': credential.tenant_name},
          {'key': 'OS_AUTH_URL', 'value': credential.url},
          {'key': 'OS_PASSWORD', 'value': credential.password},
          {'key': 'OS_PROJECT_NAME', 'value': credential.tenant_name},
          {'key': 'OS_RC_FILE', 'value': btoa(credential.rc_file)},
          {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
          {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
          {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
        ]
      };
    }

    if (this.use_https){
      value.fields.push({'key': 'TF_VAR_cloudflare_proxied', 'value': true});
      selectedCloudProvider.fields.push({'key': 'TF_VAR_cloudflare_proxied', 'value': true});
    }

    if(this.config.getConfig("enable_debug_key") == true){
      value.fields.push({'key': 'use_debug_key', 'value': true});
      selectedCloudProvider.fields.push({'key': 'use_debug_key', 'value': true});
    }

    deploymentInstance.configuration.deployer = applicationDeployer;
    deploymentInstance.configuration.provider = selectedCloudProvider;
    deploymentInstance.configuration.credential = credential;
    deploymentInstance.configuration.params = value;

    deploymentInstance.progress = 10;
    deploymentInstance.status = "STARTING";
    this.lastLoadedDeploymentList.push(deploymentInstance);
    this.updateDeployments();

    setTimeout((callback) => {
      this.increment(deploymentInstance,
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
              this.addApp(deploymentInstance);
            } else {
              this._cloudCredentialsService.add(this._tokenService.getToken(), value)
                .subscribe(
                  cloudCredentials => {
                    console.log('[Profile] got response %O', cloudCredentials);
                    this.addDeploymentParameter(deploymentInstance, cloudCredentials, 0);
                  },
                  error => {
                    console.log('[Profile] error %O', error);
                    this.processError(deploymentInstance, error);
                  }
                );
            }
          }, (error) => {
            this.processError(deploymentInstance, error);
          });
        }, 2000)
      );
    }, 2000);
  }


  increment(deployment: CreDeployment, callback) {
    deployment.progress += 10;
    console.log("Current progress", deployment.progress);
  }


  getAllCloudCredential(onSuccess, onError) {
    this._cloudCredentialsService.getAll(this.credentialService.getUsername(),
      this._tokenService.getToken())
      .subscribe(
        cloudCredentials => {
          console.log('[Profile] CloudCredentials data is %O', cloudCredentials);
          onSuccess(cloudCredentials);
        },
        error => {
          console.log('[Profile] error %O', error);
          onError(error);
        }
      );
  }

  addDeploymentParameter(deploymentInstance: CreDeployment,
                         cloudProviderParameters: CloudProviderParameters, cdpId: number) {
    this.configurationService.addDeploymentParameters(this._tokenService.getToken(),
      <ConfigurationDeploymentParameters>{
        name: deploymentInstance.configuration.provider.name,
        accountUsername: this.credentialService.getUsername(),
        fields: [],
        sharedWithTeamNames: []
      }).subscribe(
      (deploymentParameters) => {
        this.addConfiguration(deploymentInstance, deploymentParameters, cloudProviderParameters, cdpId);
      }, (error) => {
        this.processError(deploymentInstance, error);
      }
    );
  }


  addConfiguration(deploymentInstance: CreDeployment, deploymentParameters: ConfigurationDeploymentParameters,
                   cloudProviderParameters: CloudProviderParameters, cdpId: number) {
    this.configurationService.add(this._tokenService.getToken(),
      <Configuration>{
        name: deploymentInstance.configuration.provider.name,
        accountUsername: this.credentialService.getUsername(),
        cloudProviderParametersName: cloudProviderParameters.name,
        sshKey: 'thisisnotused',
        deploymentParametersName: deploymentParameters.name,
        sharedWithTeamNames: [],
        obsolete: false,
        cloudProviderParametersReference: cloudProviderParameters.reference,
        configDeploymentParametersReference: deploymentParameters.reference
      }).subscribe(
      (data) => {
        deploymentInstance.configuration.deployer.configurations = [data];
        this.addApp(deploymentInstance);
      }, (error) => {
        this.processError(deploymentInstance, error);
      }
    );
  }


  addApp(deploymentInstance: CreDeployment) {
    setTimeout(() => {
      this.increment(deploymentInstance, setTimeout(() => {
        let isAppExist = false;
        this.getAllApplication(
          (appStatus) => {

            for (let i = 0; i < appStatus.length; i++) {
              console.log('name ' + appStatus[i]['name']);
              if (appStatus[i]['name'] === 'Phenomenal VRE') {
                isAppExist = true;
                console.log('exist');
                break;
              }
            }

            if (isAppExist) {
              this.getAllDeploymentServer((deployment) => {
                let isDeploymentExist = false;
                for (let i = 0; i < deployment.length; i++) {
                  if (deployment[i]['applicationName'] === 'Phenomenal VRE') {
                    isDeploymentExist = true;
                    console.log('deployment exist');
                    break;
                  }
                }

                if (!isDeploymentExist) {
                  this.removeApplication(deploymentInstance.configuration.deployer, (result) => {
                    setTimeout(() => {
                      this.increment(deploymentInstance,
                        setTimeout(() => {
                          this.addApplication(
                            deploymentInstance.configuration.deployer,
                            (addAppStatus) => {
                              if (addAppStatus.status === 401 || addAppStatus.status === 404) {
                                console.log(addAppStatus.message);
                                this.processError(deploymentInstance, addAppStatus);
                              } else {
                                this.addDeployment(deploymentInstance);
                              }
                            },
                            (error) => {
                              this.processError(deploymentInstance, error);
                            }
                          );
                        }, 2000));
                    }, 2000);

                  }, (error) => {
                    this.processError(deploymentInstance, error);
                  });
                } else {
                  setTimeout(() => {
                    this.increment(deploymentInstance,
                      setTimeout(() => {
                        this.addDeployment(deploymentInstance);
                      }, 2000));
                  }, 2000);
                }
              }, (error) => {
                this.handleError(error);
              });
            } else {
              if (appStatus.status === 401 || appStatus.status === 404) {
                console.log(appStatus.message);
                this.processError(deploymentInstance, appStatus);
              } else {
                setTimeout(() => {
                  this.increment(deploymentInstance,
                    setTimeout(() => {
                      this.addApplication(
                        deploymentInstance.configuration.deployer,
                        (addAppStatus) => {
                          this.addDeployment(deploymentInstance);
                        },
                        (error) => {
                          this.processError(deploymentInstance, error);
                        }
                      );
                    }, 2000));
                }, 2000);
              }
            }
          }, (error) => {
            this.processError(deploymentInstance, error);
          });
      }, 2000));
    }, 2000);
  }

  addDeployment(deploymentInstance: CreDeployment) {
    setTimeout(() => {
      this.increment(deploymentInstance,
        this.increment(deploymentInstance, setTimeout(() => {
          this.createDeploymentServer(
            deploymentInstance,
            (deployment) => {
              if (deployment.status === 401 || deployment.status === 404) {
                console.log(deployment.message);
                this.processError(deploymentInstance, deployment);
              } else {
                deploymentInstance.id = deployment['reference'];
                deploymentInstance.update(deployment);
                deploymentInstance.status = "STARTING";
                deploymentInstance.isInstalling = true;

                try {
                  this.setSerivcesinfo(deploymentInstance);
                  setTimeout(() => {
                    this.increment(deploymentInstance, setTimeout(
                      () => {
                        console.log(deployment);
                        // this.getDeploymentLogsFeed(deploymentInstance, 2000);
                        this.registerStatusFeed(deploymentInstance, 3000);
                      }, 2000)
                    );
                  }, 2000);
                }catch(e){
                  this.processError(deploymentInstance, e);
                }
              }
            }
          );
        }, 2000))
      );
    }, 2000);
  }


  registerStatusFeed(deploymentInstance: CreDeployment, interval: number, callback?) {
    const statusFeedSubscription = this._deploymentService.getDeploymentStatusFeed(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
        // update the status
        deploymentInstance.status = res.status;
        deploymentInstance.status_info = res;
        console.log(res);

        if (res.status === 'STARTING' && !deploymentInstance.isInstalling) {
          this.increment(deploymentInstance, () => {
          });
        }
        if (res.status === 'STARTING_FAILED') {
          this.processError(deploymentInstance, res);
          statusFeedSubscription.unsubscribe();
        }
        if (res.status === 'RUNNING' || res.status === 'DESTROYED') {
          deploymentInstance.isInstalling = false;
          deploymentInstance.isRunning++;
          if (deploymentInstance.isRunning >= 5 || res.status === 'DESTROYED') {
            statusFeedSubscription.unsubscribe();
            // Update info
            this.getDeployment(deploymentInstance.reference).subscribe((data) => {
              if (typeof deploymentInstance.update === 'function') {
                deploymentInstance.update(data);
              }
            });
          }
        }
        if (callback)
          callback(res);
      },
      error => {
        statusFeedSubscription.unsubscribe();
        this.processError(deploymentInstance, error);
        callback(error);
      }
    );
  }

  getAllApplication(onSuccess, onError) {
    this._applicationService.getAll(this.credentialService.getUsername(),
      this._tokenService.getToken())
      .subscribe(
        applications => {
          console.log('[RepositoryComponent] Applications data is %O', applications);
          onSuccess(applications);
        },
        error => {
          console.log('[RepositoryComponent] error %O', error);
          onError(error);
        }
      );
  }

  getApplication(name, onSuccess, onError) {
    this._applicationService.get(this.credentialService.getUsername(),
      this._tokenService.getToken(), <Application>{'name': name})
      .subscribe(
        application => {
          console.log('[RepositoryComponent] Application data is %O', application);
          if (application) {
            onSuccess(application);
          }
        },
        error => {
          console.log('[RepositoryComponent] error %O', error);
          onError(error);
        }
      );
  }

  addApplication(value: any, onSuccess, onError) {
    console.log('[RepositoryComponent] adding ' + value.repoUri);
    const repoUri = value.repoUri;
    this._applicationService.add(this.credentialService.getUsername(),
      this._tokenService.getToken(), repoUri)
      .subscribe(
        application => {
          console.log('[RepositoryComponent] got response %O', application);
          onSuccess(application);
        },
        error => {
          console.log('[RepositoryComponent] error %O', error);
          onError(error);
        }
      );
  }


  createDeploymentServer(deploymentInstance: CreDeployment, callback) {
    let applicationDeployer: ApplicationDeployer = deploymentInstance.configuration.deployer;
    applicationDeployer.deploying = true;
    console.log('[ProgressBar] Adding deployment for application from '
      + applicationDeployer.repoUri + ' into '
      + applicationDeployer.selectedCloudProvider + ' surname ' + this.credentialService.getUsername());
    this._deploymentService.add(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      applicationDeployer,
      deploymentInstance.configuration.provider,
      applicationDeployer.attachedVolumes,
      applicationDeployer.assignedInputs,
      applicationDeployer.assignedParameters,
      applicationDeployer.configurations[0]
    ).subscribe(
      deployment => {
        console.log('[RepositoryComponent] deployed %O', deployment);
        callback(deployment);
      },
      error => {
        console.log('[RepositoryComponent] error %O', error);
        this.processError(deploymentInstance, error);
        callback(error);
      }
    );
  }

  getAllDeploymentServer(onSuccess, onError) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()
    ).subscribe(
      deployment => {
        console.log('[RepositoryComponent] getAll %O', deployment);
        onSuccess(deployment);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        onError(error);
      }
    );
  }

  removeApplication(applicationDeployer: ApplicationDeployer, onSuccess, onError) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this._tokenService.getToken(), applicationDeployer).subscribe(
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

  private generateUIDNotMoreThan1million() {
    return ('000000' + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
  }

  private generateName(): string {
    return 'ph' + this.generateUIDNotMoreThan1million();
  }

  configDeploymentInstance(credential: Credential): CreDeployment {
    let deployer, params, provider;
    let prefixName = this.generateName();
    let deploymentName = prefixName + '-' + credential.provider;

    if (credential.provider === 'AWS') {
      params = this.getAwsConfig(deploymentName, credential);
      deployer = this.configAwsDeployer(deploymentName, credential);
      provider = this.configAwsProvider(deploymentName, credential);
    } else if (credential.provider === 'GCP') {
      params = this.getGcpConfig(deploymentName, credential);
      deployer = this.configGcpDeployer(deploymentName, credential);
      provider = this.configGcpProvider(deploymentName, credential);
    } else {
      params = this.getOStackConfig(deploymentName, credential);
      deployer = this.configOStackDeployer(deploymentName, credential);
      provider = this.configOStackProvider(deploymentName, credential);
    }
    return new CreDeployment(
      prefixName + "-" + provider.cloudProvider,
      this,
      <DeploymentConfiguration>{
        params: params,
        deployer: deployer,
        provider: provider,
        credential: credential
      }
    );
  }


  configAwsDeployer(deploymentName: string, credential: Credential): ApplicationDeployer {
    let applicationDeployer = <ApplicationDeployer> {
      name: 'Phenomenal VRE',
      accountUsername: credential.username,
      repoUri: this.repoUrl,
      selectedCloudProvider: 'AWS'
    };
    applicationDeployer.attachedVolumes = {};
    applicationDeployer.assignedInputs = {
      cluster_prefix: deploymentName,
      // aws_access_key_id: credential.access_key_id,
      // aws_secret_access_key: credential.secret_access_key,
      // aws_region: credential.default_region,
      availability_zone: credential.default_region + 'b',
      master_as_edge: 'true',
      master_instance_type: 't2.xlarge',
      node_count: '2',
      node_instance_type: 't2.xlarge',
      glusternode_count: '1',
      glusternode_instance_type: 't2.xlarge',
      glusternode_extra_disk_size: '100',
      phenomenal_pvc_size: '95Gi',
      galaxy_admin_email: credential.galaxy_admin_email,
      galaxy_admin_password: credential.galaxy_admin_password
      // jupyter_password: credential.galaxy_admin_password,
      // dashboard_username: credential.galaxy_admin_email,
      // dashboard_password: credential.galaxy_admin_password
    };
    applicationDeployer.assignedParameters = {};
    applicationDeployer.configurations = [];
    return applicationDeployer;
  }

  configGcpDeployer(deploymentName: string, credential: Credential): ApplicationDeployer {
    let applicationDeployer = <ApplicationDeployer> {
      name: 'Phenomenal VRE',
      accountUsername: credential.username,
      repoUri: this.repoUrl,
      selectedCloudProvider: 'GCP'
    };
    applicationDeployer.attachedVolumes = {};
    applicationDeployer.assignedInputs = {
      cluster_prefix: deploymentName,
      gce_project: credential.tenant_name,
      gce_zone: credential.default_region,
      master_as_edge: 'true',
      master_flavor: 'n1-standard-2',
      node_count: '2',
      node_flavor: 'n1-standard-2',
      glusternode_count: '1',
      glusternode_flavor: 'n1-standard-2',
      glusternode_extra_disk_size: '100',
      phenomenal_pvc_size: '95Gi',
      galaxy_admin_email: credential.galaxy_admin_email,
      galaxy_admin_password: credential.galaxy_admin_password
      // jupyter_password: credential.galaxy_admin_password,
      // dashboard_username: credential.galaxy_admin_email,
      // dashboard_password: credential.galaxy_admin_password
    };
    applicationDeployer.assignedParameters = {};
    applicationDeployer.configurations = [];
    return applicationDeployer;
  }

  configOStackDeployer(deploymentName: string, credential: Credential): ApplicationDeployer {
    let applicationDeployer = <ApplicationDeployer> {
      name: 'Phenomenal VRE',
      accountUsername: credential.username,
      repoUri: this.repoUrl,
      selectedCloudProvider: 'OSTACK'
    };
    applicationDeployer.attachedVolumes = {};
    applicationDeployer.assignedInputs = {
      cluster_prefix: deploymentName,
      floating_ip_pool: credential.ip_pool,
      external_network_uuid: credential.network,
      master_as_edge: 'true',
      master_flavor: credential.flavor,
      node_count: '2',
      node_flavor: credential.flavor,
      glusternode_count: '1',
      glusternode_flavor: credential.flavor,
      glusternode_extra_disk_size: '100',
      phenomenal_pvc_size: '95Gi',
      galaxy_admin_email: credential.galaxy_admin_email,
      galaxy_admin_password: credential.galaxy_admin_password
      // jupyter_password: credential.galaxy_admin_password,
      // dashboard_username: credential.galaxy_admin_email,
      // dashboard_password: credential.galaxy_admin_password
    };
    applicationDeployer.assignedParameters = {};
    applicationDeployer.configurations = [];
    return applicationDeployer;
  }

  configAwsProvider(deploymentName: string, credential: Credential): {} {
    return {
      name: deploymentName,
      accountUsername: credential.username,
      cloudProvider: 'AWS',
      fields: [
        {'key': 'TF_VAR_aws_access_key_id', 'value': credential.access_key_id},
        {'key': 'TF_VAR_aws_secret_access_key', 'value': credential.secret_access_key},
        {'key': 'TF_VAR_aws_region', 'value': credential.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ],
      sharedWithAccountEmails: [],
      sharedWithTeamNames: [],
      reference: ''
    };
  }

  configGcpProvider(deploymentName: string, credential: Credential): {} {
    return {
      name: deploymentName,
      accountUsername: credential.username,
      cloudProvider: 'GCP',
      fields: [
        {'key': 'GOOGLE_CREDENTIALS', 'value': credential.access_key_id.replace(/\\n/g, '\\n')},
        {'key': 'GCE_PROJECT', 'value': credential.tenant_name},
        {'key': 'GCE_ZONE', 'value': credential.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ],
      sharedWithAccountEmails: [],
      sharedWithTeamNames: [],
      reference: ''
    };
  }

  configOStackProvider(deploymentName: string, credential: Credential): {} {
    return {
      name: deploymentName,
      accountUsername: credential.username,
      cloudProvider: 'OSTACK',
      fields: [
        {'key': 'OS_USERNAME', 'value': credential.username},
        {'key': 'OS_TENANT_NAME', 'value': credential.tenant_name},
        {'key': 'OS_AUTH_URL', 'value': credential.url},
        {'key': 'OS_PASSWORD', 'value': credential.password},
        {'key': 'OS_PROJECT_NAME', 'value': credential.tenant_name},
        {'key': 'OS_RC_FILE', 'value': credential.rc_file},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ],
      sharedWithAccountEmails: [],
      sharedWithTeamNames: [],
      reference: ''
    };
  }


  getAwsConfig(deploymentName: string, credential: Credential): {} {
    return {
      'name': deploymentName,
      'cloudProvider': credential.provider,
      'fields': [
        {'key': 'TF_VAR_aws_access_key_id', 'value': credential.access_key_id},
        {'key': 'TF_VAR_aws_secret_access_key', 'value': credential.secret_access_key},
        {'key': 'TF_VAR_aws_region', 'value': credential.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ]
    };
  }

  getGcpConfig(deploymentName: string, credential: Credential): {} {
    return {
      'name': deploymentName,
      'cloudProvider': credential.provider,
      'fields': [
        {'key': 'GOOGLE_CREDENTIALS', 'value': credential.access_key_id.replace(/\\n/g, '\\n')},
        {'key': 'GCE_PROJECT', 'value': credential.tenant_name},
        {'key': 'GCE_ZONE', 'value': credential.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ]
    };
  }

  getOStackConfig(deploymentName: string, credential: Credential): {} {
    return {
      'name': deploymentName,
      'cloudProvider': credential.provider,
      'fields': [
        {'key': 'OS_USERNAME', 'value': credential.username},
        {'key': 'OS_TENANT_NAME', 'value': credential.tenant_name},
        {'key': 'OS_AUTH_URL', 'value': credential.url},
        {'key': 'OS_PASSWORD', 'value': credential.password},
        {'key': 'OS_PROJECT_NAME', 'value': credential.tenant_name},
        {'key': 'OS_RC_FILE', 'value': btoa(credential.rc_file)},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': credential.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': credential.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': credential.galaxy_admin_password}
      ]
    };
  }

  private handleError(error: Response) {
    console.log('[DeploymentService] error %O', error);
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    return Observable.throw(error.json ? <Error>error.json() : error);
  }


  public getDeploymentLogs(deploymentReference: string): Observable<string> {
    return this._deploymentService.getDeploymentLogs(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      <Deployment>{reference: deploymentReference});
  }

  public monitorDeploymentLogs(deployment: Deployment, interval: number) {
    const logsFeedSubscription = this._deploymentService.getDeploymentLogsFeed(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deployment, interval).subscribe(
      res => {
        deployment['logs'] = this.sanitizeLogs(res);
      },
      error => {
        logsFeedSubscription.unsubscribe();
      },
      () => {
        console.log('[DeploymentComponent] Deployment logs feed retrieved');
      }
    );
    deployment['logsFeedSubscription'] = logsFeedSubscription;
  }

  public sanitizeLogs(logs){
    return logs.replace(new RegExp("FAILED - RETRYING", 'g'), " - RETRYING");
  }

  public getDeploymentLogsFeed(deploymentInstance: CreDeployment, interval: number) {

    const logsFeedSubscription = this._deploymentService.getDeploymentLogsFeed(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
        console.log("Current log", deploymentInstance["logs"]);
        console.log("Updated log", res);
        deploymentInstance["logs"] = res;
        if (deploymentInstance.status === 'RUNNING') {
          deploymentInstance["logsFeedSubscription"].unsubscribe();
        }
      },
      error => {
        logsFeedSubscription.unsubscribe();
      },
      () => {
        console.log('[DeploymentComponent] Deployment logs feed retrieved');
        deploymentInstance["logsFeedSubscription"].unsubscribe();
      }
    );
    deploymentInstance["logsFeedSubscription"] = logsFeedSubscription;
  }

  private processError(deploymentInstance: CreDeployment, error) {
    let errMsg = error;
    let ej = error;
    console.error(error);
    if (error instanceof Response) {
      console.log("Response", error);
      ej = error.json();
    }
    if (typeof ej === 'object') {
      console.log("Error object", ej);
      let message = "";
      if (Array.isArray(ej)) {
        for (let e of ej) {
          message += e.message + " ";
        }
      }
      console.log(message);
      errMsg = message;
    }
    // set error info
    deploymentInstance.isError = true;
    deploymentInstance['error'] = errMsg;
    // update deployment status
    if (deploymentInstance.reference) {
      this._deploymentService.getDeploymentStatus(
        this.credentialService.getUsername(),
        this._tokenService.getToken(),
        deploymentInstance).subscribe(
        status => {
          deploymentInstance.status = status.status;
          deploymentInstance.status_info = status;
        });
    } else {
      // update the status when the deployment has not been created yet
      deploymentInstance.status = 'STARTING_FAILED';
    }
    return error;
  }
}
