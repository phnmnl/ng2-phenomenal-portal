import { Subscription } from "rxjs/Subscription";
import { DeployementService } from "./deployement.service";
import { DeploymentConfiguration } from "./deployementConfiguration";
import {
  Application,
  CloudProviderParameters, Configuration, ConfigurationService,
  Deployment as BaseDeployment,
  DeploymentAssignedInput,
  DeploymentAssignedParameter,
  DeploymentAttachedVolume, DeploymentGeneratedOutput
} from "ng2-cloud-portal-service-lib";
import { CloudProviderParametersCopy } from "ng2-cloud-portal-service-lib/dist/services/cloud-provider-parameters/cloud-provider-parameters-copy";
import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { PipelineStatus } from "./pipeline-status";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs";
import { AppConfig } from "../../../app.config";
import { AwsDeploymentConfigurationParameters } from "./aws-deployment-configuration-parameters";
import { DeploymentConfigurationParameters } from "../../../setup/deployment-configuration-parameters";

export class Deployment implements BaseDeployment {

  // Interface properties
  id: string;
  providerId: string;
  reference: string;
  accessIp: string;
  applicationAccountUsername: string;
  applicationName: string;
  generatedOutputs: DeploymentGeneratedOutput[];
  configuration: Configuration;
  configurationName: string;
  configurationParameters: BaseDeploymentConfigurationParameters;
  cloudProviderParametersCopy: CloudProviderParametersCopy;
  assignedInputs: DeploymentAssignedInput[];
  assignedParameters: DeploymentAssignedParameter[];
  attachedVolumes: DeploymentAttachedVolume[];

  // additional info
  readonly repoUrl;
  readonly use_https: boolean;

  // status and progress
  status: string = "UNDEFINED";
  status_info: any;
  status_details: any;
  progress: number = 0;

  // errors
  isError: boolean = false;
  errors = {};

  // logs
  private _lastLogLine: string;
  private _deployLogs: string;
  private _destroyLogs: string;

  // to support log observers
  private deployLogsSubject = new Subject<string>();
  private destroyLogsSubject = new Subject<string>();

  // configuration
  private config: AppConfig;

  // Aux references
  application: Application;
  cloudProviderParameters: object;
  deploymentParameters: object;


  constructor(config: AppConfig, configurationParameters?: BaseDeploymentConfigurationParameters) {
    this.config = config;
    if (configurationParameters) {
      this.configurationName = configurationParameters.getDeploymentName();
      this.configurationParameters = configurationParameters;
    }
    this.repoUrl = config.getConfig('deployment_repo_url');
    this.use_https = config.getConfig('enable_https');
  }


  get name(): string {
    return this.configurationName;
  }

  public isRunning(): boolean {
    return this.status === "RUNNING";
  }

  public isStarting(): boolean {
    return this.status === "STARTING";
  }

  public isDestroying(): boolean {
    return this.status === "DESTROYING";
  }

  public isDestroyed(): boolean {
    return this.status === "DESTROYED";
  }

  public isStartedFailed(): boolean {
    return this.status === "STARTING_FAILED";
  }

  public isDestroyFailed(): boolean {
    return this.status === "DESTROY_FAILED";
  }

  get cloudProviderName() {
    return this.cloudProviderParametersCopy ?
      this.cloudProviderParametersCopy.cloudProvider :
      this.configurationParameters ? this.configurationParameters.getProviderName() : "";
  }

  public getConfiguration() {
    return this.configuration;
  }

  public getConfigurationParameters() {
    return this.configurationParameters;
  }

  set destroyLogs(logs: string) {
    this._destroyLogs = Deployment.sanitizeLogs(logs);
    this._lastLogLine = Deployment.getLastLog(this._destroyLogs);
    this.destroyLogsSubject.next(this._destroyLogs);
  }

  get destroyLogs(): string {
    return this._destroyLogs;
  }

  public getDestroyLogsAsObservable(): Observable<string> {
    return this.destroyLogsSubject.asObservable();
  }

  set deployLogs(logs: string) {
    this._deployLogs = Deployment.sanitizeLogs(logs);
    this._lastLogLine = Deployment.getLastLog(this._deployLogs);
    this.deployLogsSubject.next(this._deployLogs);
  }

  get deployLogs(): string {
    return this._deployLogs;
  }

  public getDeployLogsAsObservable(): Observable<string> {
    return this.deployLogsSubject.asObservable();
  }


  get lastLogLine(): string {
    return this._lastLogLine;
  }


  public static getDeploymentFromData(config: AppConfig, data: BaseDeployment) {
    let deployment: Deployment = new Deployment(config);
    deployment = Object.assign(deployment, data);
    Deployment.setSerivcesinfo(deployment);
    return deployment;
  }

  public static getDeploymentConfiguration(config: AppConfig, parameters: DeploymentConfigurationParameters) {
    let repoUrl: string = config.getConfig('deployment_repo_url');
    let use_https: boolean = config.getConfig('enable_https');
    if (parameters.provider === "AWS")
      return new AwsDeploymentConfigurationParameters(parameters, repoUrl);
    throw new Error("Invalid provider" + parameters.provider);
  }

  public static buildFromConfigurationParameters(config: AppConfig, parameters: DeploymentConfigurationParameters): Deployment {
    // TODO: fix the username
    // parameters.username = this.credentialService.getUsername();
    return new Deployment(config, Deployment.getDeploymentConfiguration(config, parameters));
  }

  private static setSerivcesinfo(deployment: Deployment) {
    for (let i = 0; i < deployment.assignedInputs.length; i++) {
      let separator = deployment.use_https ? "-" : ".";
      let protocol = deployment.use_https ? "https://" : "http://";
      if (deployment['assignedInputs'][i]['inputName'] === 'cluster_prefix') {
        deployment['galaxyUrl'] = protocol + 'galaxy' + separator + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
        deployment['luigiUrl'] = protocol + 'luigi' + separator + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
        deployment['jupyterUrl'] = protocol + 'notebook' + separator + deployment['assignedInputs'][i]['assignedValue'] + '.phenomenal.cloud';
      }
      if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_email') {
        deployment['galaxyAdminEmail'] = deployment['assignedInputs'][i]['assignedValue'];
      }
      if (deployment['assignedInputs'][i]['inputName'] === 'galaxy_admin_password') {
        deployment['galaxyAdminPassword'] = deployment['assignedInputs'][i]['assignedValue'];
      }
    }
  }


  private static getLastLog(logs) {
    if (logs) {
      logs = logs.replace(/^\s*\n/gm, "");
      let lines = logs.match(/[^\r\n]+/g);
      let line = lines.length > 0 ? lines[lines.length - 1] : "";
      return line.replace(/\*+|-|RETRYING:/g, "");
    }
    return "";
  }

  private static sanitizeLogs(logs) {
    return logs.replace(new RegExp("FAILED - RETRYING", 'g'), " - RETRYING");
  }

  public update(...args: any[]): any {
    for (const obj of args) {
      for (const key in obj) {
        //copy all the fields
        this[key] = obj[key];
      }
    }
    return this;
  };

}
