import { Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  AccountService, Application,
  ApplicationService,
  CloudProviderParametersService,
  Configuration,
  ConfigurationDeploymentParameters,
  ConfigurationService,
  CredentialService,
  DeploymentService as BaseDeploymentService,
  TokenService
} from "ng2-cloud-portal-service-lib";
import { AppConfig } from "../../../app.config";
import { Subject } from "rxjs/Subject";
import { Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";
import { CloudProviderMetadataService } from "../cloud-provider-metadata/cloud-provider-metadata.service";
import { Pipeline } from "./pipeline";
import { Deployment } from "./deployment";
import { PipelineStepResult } from "./pipeline-step-result";
import { PhenoMeNalPipeline } from "./phenomenal-pipeline";
import { Subscription } from "rxjs";


@Injectable()
export class DeployementService implements OnInit, OnDestroy {

  private lastLoadedDeploymentList: Deployment[];
  private observableDeploymentList = new Subject<Deployment[]>();

  constructor(private _applicationService: ApplicationService,
              private _cloudProviderParameterService: CloudProviderParametersService,
              private _deploymentService: BaseDeploymentService,
              private _tokenService: TokenService,
              public credentialService: CredentialService,
              public _accountService: AccountService,
              public providerMetadataService: CloudProviderMetadataService,
              public configurationService: ConfigurationService,
              private config: AppConfig) {

    this.observableDeploymentList.asObservable().subscribe((deployments: Deployment[]) => {
      this.checkForUnlinkedDeploymentConfigurations(deployments);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public getDeployment(reference: string, loadStatus: boolean = true, loadLogs: boolean = true): Observable<Deployment> {
    return this._deploymentService.get(
      this.credentialService.getUsername(), this._tokenService.getToken(),
      <Deployment>{reference: reference}
    ).switchMap(data => {
        if (!loadStatus) return Observable.of(data);
        return this._deploymentService.getDeploymentStatus(
          this.credentialService.getUsername(), this._tokenService.getToken(), data)
          .map((res) => {
            data['statusDetails'] = res;
            return data;
          });
      }
    ).switchMap(data => {
        if (!loadLogs) return Observable.of(data);
        return this._deploymentService.getDeploymentLogs(
          this.credentialService.getUsername(), this._tokenService.getToken(),
          <Deployment>{reference: data.reference}).map((logs) => {
          data["deployLogs"] = logs;
          return data;
        })
      }
    ).switchMap(data => {
        if (!loadLogs) return Observable.of(data);
        return this._deploymentService.getDeploymentDestroyLogs(
          this.credentialService.getUsername(),
          this._tokenService.getToken(),
          <Deployment>{reference: data.reference}).map((logs) => {
          data["destroyLogs"] = logs;
          return data;
        });
      }
    ).map(data => {
      let deployment: Deployment = Deployment.getDeploymentFromData(this.config, data);
      deployment.deployLogs = data["deployLogs"];
      deployment.destroyLogs = data["destroyLogs"];
      // activate status and log monitoring
      this.setupDeploymentMonitoring(deployment);
      return deployment;
    }).catch(this.handleError);
  }

  private addDeployment(deployment: Deployment) {
    if(!this.lastLoadedDeploymentList)
      this.lastLoadedDeploymentList = [];
    this.lastLoadedDeploymentList.push(deployment);
    this.observableDeploymentList.next(this.lastLoadedDeploymentList);
  }

  private removeDeployment(deployment: Deployment) {
    let index = this.lastLoadedDeploymentList.indexOf(deployment);
    if (index >= 0) {
      this.lastLoadedDeploymentList.splice(index, 1);
      this.observableDeploymentList.next(this.lastLoadedDeploymentList);
    }
  }

  private updateDeploymentsList(deployments: Deployment[]) {
    this.lastLoadedDeploymentList = deployments;
    this.observableDeploymentList.next(deployments);
  }

  public getDeployments(): Observable<Deployment[]> {
    return this.observableDeploymentList.asObservable();
  }


  private loadDeployments(loadStatus: boolean = false, loadLogs: boolean = false) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(), this._tokenService.getToken()
    ).subscribe(deployments => {
      let result: Observable<Deployment>[] = [];
      console.log("MAP", deployments);
      deployments.forEach((deploymentData) => {
        console.log("Deployment DATA", deploymentData);
        result.push(this.getDeployment(deploymentData.reference, loadStatus, loadLogs)
          .map((deployment: Deployment) => {
            if (deployment.isStarting() || deployment.isRunning()) {
              let pipeline = PhenoMeNalPipeline.getConfigurationPipeline(this, deployment);
              pipeline.seek(deployment);
              pipeline.exec(deployment, () => {
                console.log("Deployment terminated!!!!");
                console.log("Progress", pipeline.getProgress());
              });
            }
            return deployment;
          })
        );
      });

      // update deployments list
      if (result.length > 0)
        Observable.forkJoin(result).subscribe(deploymentList => {
          this.updateDeploymentsList(deploymentList);
        });
      else this.updateDeploymentsList([]);
    });
  }

  public updateDeployments(forceReload: boolean = false) {
    console.log("UPDATING DEPLOYMENTS infos.....", forceReload);
    if (forceReload || !this.lastLoadedDeploymentList) {
      this.loadDeployments(true, true);
    } else {
      console.log("Notifying number of deployments", this.lastLoadedDeploymentList.length);
      this.observableDeploymentList.next(this.lastLoadedDeploymentList);
    }
  }

  public deploy(deployment: Deployment) {
    deployment.status = "STARTING";
    this.addDeployment(deployment);
    let pipeline: Pipeline = PhenoMeNalPipeline.getCompletePipeline(this, deployment);
    console.log("Deploying", deployment);
    pipeline.exec(deployment, () => {
      console.log("Terminated deployment !!!", pipeline.description);
    });
  }


  registerCloudProviderParameters(deployment: Deployment, callback) {
    console.log("Inputs", deployment.configurationParameters.getInputs());
    this._cloudProviderParameterService.add(this._tokenService.getToken(), deployment.configurationParameters.getParameters())
      .subscribe(
        cloudProviderParameters => {
          console.log('[Profile] got response %O', cloudProviderParameters);
          deployment.cloudProviderParameters = cloudProviderParameters;
          deployment.cloudProviderParametersCopy = cloudProviderParameters;
          callback();
        },
        error => {
          console.log('[Profile] error %O', error);
          callback(<PipelineStepResult>{error: error});
        }
      );
  }


  registerDeploymentParameter(deployment: Deployment, callback) {
    this.configurationService.addDeploymentParameters(this._tokenService.getToken(),
      <ConfigurationDeploymentParameters>{
        name: deployment.name,
        accountUsername: deployment.configurationParameters.getUsername(),
        fields: [],
        sharedWithTeamNames: []
      }).subscribe(
      (deploymentParameters) => {
        console.log('[Profile] got response %O', deploymentParameters);
        deployment.deploymentParameters = deploymentParameters;
        callback();
      }, (error) => {
        console.log('[Profile] error %O', error);
        callback(<PipelineStepResult>{error: error});
      }
    );
  }

  registerConfiguration(deployment: Deployment, callback) {
    this.configurationService.add(this._tokenService.getToken(),
      <Configuration>{
        name: deployment.name,
        accountUsername: deployment.configurationParameters.getUsername(),
        sshKey: 'thisisnotused',
        sharedWithTeamNames: [],
        obsolete: false,
        cloudProviderParametersName: deployment.cloudProviderParameters["name"],
        cloudProviderParametersReference: deployment.cloudProviderParameters["reference"],
        deploymentParametersName: deployment.deploymentParameters["name"],
        configDeploymentParametersReference: deployment.deploymentParameters["reference"]
      }).subscribe(
      (configuration) => {
        deployment.configurationParameters.getApplication().configurations = [configuration];
        callback();
      }, (error) => {
        console.log('[Profile] error %O', error);
        callback(<PipelineStepResult>{error: error});
      }
    );
  }


  checkExistingApplications(deployment: Deployment, callback, pipeline: Pipeline) {
    this._applicationService.getAll(this.credentialService.getUsername(), this._tokenService.getToken())
      .subscribe(
        applications => {
          console.log('[RepositoryComponent] Applications data is %O', applications);
          for (let i = 0; i < applications.length; i++) {
            console.log('name ' + applications[i]['name']);
            if (applications[i]['name'] === 'Phenomenal VRE') {
              deployment.application = applications[i];
              console.log('exist');
              break;
            }
          }
          if (!deployment.application) {
            pipeline.skipStep("ced");
            pipeline.skipStep("rea");
          }
          callback();
        }, error => {
          console.log('[Profile] error %O', error);
          callback(<PipelineStepResult>{error: error});
        });
  }

  checkExistingDeployments(deployment: Deployment, callback, pipeline: Pipeline) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()).subscribe(
      deployments => {
        console.log('[Get All Deployments] getAll %O', deployments);
        let dep = null;
        for (let i = 0; i < deployments.length; i++) {
          if (deployments[i]['applicationName'] === 'Phenomenal VRE') {
            dep = deployments[i];
            console.log('deployment exist');
            break;
          }
        }
        if (dep) {
          pipeline.skipStep("rea");
          pipeline.skipStep("aa");
        }
        callback();
      }, error => {
        console.log('[Check Existing Deployments] error %O', error);
        callback(<PipelineStepResult>{error: error});
      });
  }


  registerApplication(deployment: Deployment, callback) {
    this._applicationService.add(deployment.configurationParameters.getUsername(),
      this._tokenService.getToken(), deployment.configurationParameters.getApplication().repoUri)
      .subscribe(
        application => {
          console.log('[Adding Application] got response %O', application);
          deployment.application = application;
          callback();
        },
        error => {
          console.log('[Adding Application] error %O', error);
          callback(<PipelineStepResult>{error: error});
        }
      );
  }


  deRegisterApplication(deployment: Deployment, callback) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this._tokenService.getToken(), deployment.configurationParameters.getApplication()).subscribe(
      res => {
        console.log('[Remove Application] got response %O', res);
        callback();
      },
      error => {
        console.log('[Remove Application] error %O', error);
        callback(<PipelineStepResult>{error: error});
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


  registerDeployment(deployment: Deployment, callback) {
    let application: ApplicationDeployer = deployment.configurationParameters.getApplication();
    application.deploying = true;
    console.log('[ProgressBar] Adding deployment for application from '
      + application.repoUri + ' into '
      + application.selectedCloudProvider + ' surname ' + this.credentialService.getUsername());
    this._deploymentService.add(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      application,
      deployment.configurationParameters.getProviderName(),
      application.attachedVolumes,
      application.assignedInputs,
      application.assignedParameters,
      application.configurations[0]
    ).subscribe(
      dep => {
        console.log('[RepositoryComponent] deployed %O', dep, deployment);
        deployment.update(dep);
        this.setupDeploymentMonitoring(deployment);
        callback(deployment);
      },
      error => {
        console.log('[Adding Deployment] error %O', error);
        callback(<PipelineStepResult>{error: error});
      }
    );
  }


  setupDeploymentMonitoring(deployment: Deployment, callback?) {
    try {
      this.registerStatusFeed(deployment, 1000);
      this.registerLogsFeed(deployment, 500, callback);
    } catch (e) {
      this.processError(deployment, e);
    }
  }


  getAllCloudCredential(onSuccess, onError) {
    this._cloudProviderParameterService.getAll(this.credentialService.getUsername(),
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


  registerStatusFeed(deploymentInstance: Deployment, interval: number, callback?) {
    const statusFeedSubscription = this._deploymentService.getDeploymentStatusFeed(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deploymentInstance, interval).subscribe(
      res => {
        deploymentInstance.statusDetails = res;
        if (res.status === 'STARTING') {
        }
        if (res.status === 'STARTING_FAILED') {
          statusFeedSubscription.unsubscribe();
        }
        if (res.status === 'RUNNING' || res.status === 'DESTROYED') {
          statusFeedSubscription.unsubscribe();
          // Update info
          // this.getDeployment(deploymentInstance.reference).subscribe((data) => {
          //   if (typeof deploymentInstance.update === 'function') {
          //     deploymentInstance.update(data);
          //   }
          // });
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


  private handleError(error: Response) {
    console.log('[DeploymentService] error %O', error);
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    return Observable.throw(error.json ? <Error>error.json() : error);
  }

  public registerLogsFeed(deployment: Deployment, interval: number, callback?) {
    let logsFeedSubscription: Subscription;
    let initialStatus: string = deployment.status;
    if (deployment.isStarting() || deployment.isDestroying()) {
      logsFeedSubscription = (deployment.isStarting() ?
        this._deploymentService.getDeploymentLogsFeed(
          this.credentialService.getUsername(),
          this._tokenService.getToken(),
          deployment, interval) :
        this._deploymentService.getDeploymentDestroyLogsFeed(
          this.credentialService.getUsername(),
          this._tokenService.getToken(),
          deployment, interval))
        .subscribe(
          res => {
            if (deployment.isStarting()) {
              deployment.deployLogs = res;
            } else deployment.destroyLogs = res;
            // de-register feed if the deployment status is changed
            if (deployment.status !== initialStatus) {
              console.log(deployment.status, initialStatus);
              logsFeedSubscription.unsubscribe();
            }
            if (callback)
              callback();
          },
          error => {
            logsFeedSubscription.unsubscribe();
          },
          () => {
            console.log('[DeploymentComponent] Deployment logs feed retrieved');
          }
        );
    }
  }


  private processError(deploymentInstance: Deployment, error) {
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
    deploymentInstance.errorCause = errMsg;
    // update deployment status
    if (deploymentInstance.reference) {
      this._deploymentService.getDeploymentStatus(
        this.credentialService.getUsername(),
        this._tokenService.getToken(),
        deploymentInstance).subscribe(
        status => {
          deploymentInstance.statusDetails = status;
        });
    } else {
      // update the status when the deployment has not been created yet
      // deploymentInstance.status = 'STARTING_FAILED';
    }
    return error;
  }
}
