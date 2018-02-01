import { DeploymentConfiguration } from "./deployementConfiguration";
import { DeployerService } from "./deployer.service";
import { Subscription } from "rxjs/Subscription";
import { DeploymentInstance as DeploymentStatus } from "ng2-cloud-portal-presentation-lib/dist";
import {
  Deployment,
  DeploymentAssignedInput,
  DeploymentAssignedParameter,
  DeploymentAttachedVolume, DeploymentGeneratedOutput
} from "ng2-cloud-portal-service-lib";
import { CloudProviderParametersCopy } from "ng2-cloud-portal-service-lib/dist/services/cloud-provider-parameters/cloud-provider-parameters-copy";

export class DeploymentInstance implements Deployment {
  id: string;
  configuration: DeploymentConfiguration;
  status: string = "UNDEFINED";
  status_info: any;
  progress: number = 0;
  isInstalling: boolean = false;
  isRunning: number = 0;
  isError: boolean = false;
  errors = {};
  logsFeedSubscription: Subscription;
  deployer: DeployerService;

  // Intercace properties
  accessIp: string;
  applicationAccountUsername: string;
  applicationName: string;
  assignedInputs: DeploymentAssignedInput[];
  assignedParameters: DeploymentAssignedParameter[];
  attachedVolumes: DeploymentAttachedVolume[];
  cloudProviderParametersCopy: CloudProviderParametersCopy;
  configurationName: string;
  generatedOutputs: DeploymentGeneratedOutput[];
  providerId: string;
  reference: string;


  constructor(name: string, deployer: DeployerService, configuration: DeploymentConfiguration) {
    this.configurationName = name;
    this.configuration = configuration;
    this.deployer = deployer;
    if (this.configuration) {
      // this.cloudProviderParametersCopy = this.configuration.provider;
    }
  }

  public start() {
    this.deployer.deploy(this);
  }

  // public setStatus(status: DeploymentStatus){
  //
  //   if (status.status === 'STARTING_FAILED') {
  //     this.status[this.progress / 10] = 'ERROR: ' + status.status;
  //     this.isError = true;
  //   }
  //   if (status.status === 'STARTING' && isStarted) {
  //     isStarted = false;
  //     this.increment(() => {
  //     });
  //   }
  //
  //   if (status.status === 'RUNNING') {
  //     this.increment(() => {
  //     });
  //   }
  // }

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
