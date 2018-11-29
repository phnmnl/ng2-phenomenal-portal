import { BaseDeploymentConfigurationParameters } from './base-deployment-configuration-parameters';
import { AwsDeploymentConfigurationParameters } from "./aws-deployment-configuration-parameters";
import { OpenstackDeploymentConfigurationParameters } from "./openstack-deployment-configuration-parameters";
import { GcpDeploymentConfigurationParameters } from "./gcp-deployment-configuration-parameters";

export class CloudProvider {

  public static PROVIDER_TYPE = {
    aws: {
      name: "aws",
      configClass: AwsDeploymentConfigurationParameters
    },
    ostack: {
      name: "ostack",
      configClass: OpenstackDeploymentConfigurationParameters
    },
    gcp: {
      name: "gpc",
      configClass: GcpDeploymentConfigurationParameters
    }
  };


  title: string;
  name: string;
  help: string;
  description: string;
  paymentDescription: string;
  providerDescription: string;
  locationDescription: string;
  logo: string;
  //credential: BaseDeploymentConfigurationParameters;
  parameters: BaseDeploymentConfigurationParameters;
  preconfigured: boolean = false;
  preset: string = null;


  constructor(config?: {}) {
    if (config) {
      for (let p of Object.keys(config)) {
        if (p != "rc_file") {
          this[p] = config[p];
          console.log("Setting ", p, this[p], config[p]);
        }
      }
      if (this.name.toLowerCase() !== "phenomenal") {
        if (Object.keys(CloudProvider.PROVIDER_TYPE).indexOf(this.name) < 0) {
          console.error("Not valid provider", this.name);
        } else {
          let cloudConfig = {};
          if (config['rc_file']) {
            cloudConfig['rc_file'] = config['rc_file'];
            cloudConfig['preconfigured'] = this.preconfigured;
            cloudConfig['preset'] = this.preset;
          }
          this.parameters = new CloudProvider.PROVIDER_TYPE[this.name].configClass(cloudConfig);
          console.log("[DEBUG] CloudProvider set parameters to %O", this.parameters);
        }
      }
    }
  }

  public isAws(): boolean {
    return this.name === CloudProvider.PROVIDER_TYPE.aws.name;
  }

  public isOstack(): boolean {
    return this.name === CloudProvider.PROVIDER_TYPE.ostack.name;
  }

  public isGpc(): boolean {
    return this.name === CloudProvider.PROVIDER_TYPE.gcp.name;
  }

  public static clone(origin: CloudProvider): CloudProvider {
    console.log("Instance type: ", origin);
    let result = new CloudProvider();
    for (let p of Object.keys(origin)) {
        result[p] = origin[p];
    }
    result.parameters = new CloudProvider.PROVIDER_TYPE[origin.name].configClass(origin.parameters);

    return result;
  }
}

