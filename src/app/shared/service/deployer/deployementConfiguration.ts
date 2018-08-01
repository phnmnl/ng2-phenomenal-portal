import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";
import { CloudProviderParameters } from "ng2-cloud-portal-service-lib";
import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";

export class DeploymentConfiguration {

  params: CloudProviderParameters;
  deployer: ApplicationDeployer;
  provider: any; // CloudProviderParameters;
  credential: BaseDeploymentConfigurationParameters;
}
