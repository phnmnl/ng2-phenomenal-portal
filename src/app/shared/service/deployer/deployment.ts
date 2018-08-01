import {
  Application,
  CloudProviderParameters, Configuration, ConfigurationDeploymentParameter, ConfigurationService,
  Deployment as BaseDeployment,
  DeploymentAssignedInput,
  DeploymentAssignedParameter,
  DeploymentAttachedVolume, DeploymentGeneratedOutput
} from "ng2-cloud-portal-service-lib";
import { CloudProviderParametersCopy } from "ng2-cloud-portal-service-lib/dist/services/cloud-provider-parameters/cloud-provider-parameters-copy";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs";
import { AppConfig } from "../../../app.config";
import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { DeploymentStatusTransition } from "./deployment-status-transition";
import { DeploymentStatus } from "./deployment-status";


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
  status: string;
  private _status_details: any;
  private _statusTransition: DeploymentStatusTransition;
  private statusDetailsSubject = new Subject<DeploymentStatus>();

  // time
  private _startedTime: number;
  private _deployedTime: number;
  private _failedTime: number;
  private _destroyedTime: number;

  //
  private _instanceCount: number;
  private _totalDiskGb: number;
  private _totalRamGb: number;
  private _totalRunningTime: number;
  private _totalVcpus: number;

  // errors
  private _errorCause: string;

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
  cloudProviderParameters: CloudProviderParameters;
  deploymentParameters: ConfigurationDeploymentParameter;


  constructor(config: AppConfig, configurationParameters?: BaseDeploymentConfigurationParameters) {
    this.config = config;
    console.log("Configuration parameters", this.config, configurationParameters);
    if (configurationParameters) {
      this.configurationName = configurationParameters.deploymentName;
      this.configurationParameters = configurationParameters;
    }
    this.repoUrl = config.getConfig('deployment_repo_url');
    this.use_https = config.getConfig('enable_https');
  }


  get name(): string {
    return this.configurationName;
  }

  public getDeploymentStatusAsObservable(): Observable<DeploymentStatus> {
    return this.statusDetailsSubject.asObservable();
  }

  get deploymentStatus(): DeploymentStatus {
    return <DeploymentStatus>{
      startedTime: this._startedTime,
      deployedTime: this._deployedTime,
      failedTime: this._failedTime,
      destroyedTime: this._destroyedTime,
      transition: this.statusTransition,
      errorCause: this.errorCause,
      instanceCount: this.instanceCount,
      totalDiskGb: this.totalDiskGb,
      totalRamGb: this.totalRamGb,
      totalRunningTime: this.totalRunningTime,
      totalVcpus: this.totalVcpus
    };
  }

  get statusTransition(): DeploymentStatusTransition {
    return this._statusTransition;
  }

  set statusTransition(value: DeploymentStatusTransition) {
    this._statusTransition = value;
    console.log("Updating deploy status", this._statusTransition);
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get statusDetails(): object {
    return this._status_details;
  }

  set statusDetails(status) {
    if (status) {
      this._status_details = status;
      for (let key in status)
        this[key] = status[key];
      this.statusDetailsSubject.next(this.deploymentStatus);
    }
  }

  get startedTime(): number {
    return this._startedTime;
  }

  set startedTime(value: number) {
    this._startedTime = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get deployedTime(): number {
    return this._deployedTime;
  }

  set deployedTime(value: number) {
    this._deployedTime = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get failedTime(): number {
    return this._failedTime;
  }

  set failedTime(value: number) {
    this._failedTime = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get destroyedTime(): number {
    return this._destroyedTime;
  }

  set destroyedTime(value: number) {
    this._destroyedTime = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }


  get instanceCount(): number {
    return this._instanceCount;
  }

  set instanceCount(value: number) {
    this._instanceCount = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get totalDiskGb(): number {
    return this._totalDiskGb;
  }

  set totalDiskGb(value: number) {
    this._totalDiskGb = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get totalRamGb(): number {
    return this._totalRamGb;
  }

  set totalRamGb(value: number) {
    this._totalRamGb = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get totalRunningTime(): number {
    return this._totalRunningTime;
  }

  set totalRunningTime(value: number) {
    this._totalRunningTime = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get totalVcpus(): number {
    return this._totalVcpus;
  }

  set totalVcpus(value: number) {
    this._totalVcpus = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  get errorCause(): string {
    return this._errorCause;
  }

  set errorCause(value: string) {
    this._errorCause = value;
    this.statusDetailsSubject.next(this.deploymentStatus);
  }

  public cleanErrors() {
    this._errorCause = null;
    this.statusDetailsSubject.next(this.deploymentStatus);
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

  public isUsingResources(): boolean {
    return this.totalVcpus !== 0
      || this.totalRamGb !== 0
      || this.totalDiskGb !== 0
      || this.instanceCount !== 0;
  }

  public isFaulty(): boolean {
    return this.isStartedFailed() || this.isDestroyingFailed() || this._errorCause && this._errorCause.length > 0;
  }

  public isDestroyingFailed(): boolean {
    return this.status === "DESTROYING_FAILED";
  }

  public isDeletionAllowed(): boolean {
    return this.isDestroyed() || (this.isDestroyingFailed() && this.deployedTime===null);
  }

  get cloudProviderName() {
    return this.cloudProviderParametersCopy ?
      this.cloudProviderParametersCopy.cloudProvider :
      this.configurationParameters ? this.configurationParameters.provider : "";
  }

  public useAwsProvider() {
    return this.cloudProviderName.toLowerCase() === "aws";
  }

  public useOStackProvider() {
    return this.cloudProviderName.toLowerCase() === "ostack";
  }

  public useGcpProvider() {
    return this.cloudProviderName.toLowerCase() === "gcp";
  }

  public usePreset(): boolean {
    if (this.assignedInputs) {
      for (let i of this.assignedInputs) {
        if (i.inputName === "preset")
          return i.assignedValue && i.assignedValue.length > 0;
      }
    } else if (this.configurationParameters)
      return this.configurationParameters.preconfigured;
    return false;
  }

  public get preset(): string {
    if (this.assignedInputs) {
      for (let i of this.assignedInputs) {
        if (i.inputName === "preset")
          return i.assignedValue;
      }
    } else if (this.configurationParameters)
      return this.configurationParameters.preset;
    return "";
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

  public static buildFromConfigurationParameters(config: AppConfig, parameters: BaseDeploymentConfigurationParameters): Deployment {
    return new Deployment(config, parameters);
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
        console.log("Updating field", key, obj[key]);
        this[key] = obj[key];
        console.log("Updated object", this);
      }
    }
    Deployment.setSerivcesinfo(this);
    return this;
  };
}
