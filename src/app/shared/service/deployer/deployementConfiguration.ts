import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";
import { CloudProviderParameters } from "ng2-cloud-portal-service-lib";
import { Credential } from "../../../setup/credential";

export class DeploymentConfiguration {

  params: CloudProviderParameters;
  deployer: ApplicationDeployer;
  provider: any; // CloudProviderParameters;
  credential: Credential;
}
