import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";
import { DeploymentConfigurationParameters } from "../../../setup/deployment-configuration-parameters";

export abstract class BaseDeploymentConfigurationParameters {

  protected readonly username;
  protected readonly providerName;
  protected readonly clusterPrefix;
  protected readonly deploymentName;
  protected readonly applicationRepoUrl;
  protected readonly application: ApplicationDeployer;


  constructor(parameters: DeploymentConfigurationParameters, applicationRepoUrl) {
    this.username = parameters.username;
    this.providerName = parameters.provider;
    this.applicationRepoUrl = applicationRepoUrl;
    this.clusterPrefix = BaseDeploymentConfigurationParameters.generateName();
    this.deploymentName = this.clusterPrefix + "-" + parameters.provider;
    this.initInputs(parameters);
    this.initParameters(parameters);
    this.application = this.initApplication(parameters);
  }

  public getUsername(){
    return this.username;
  }

  public getProviderName() {
    return this.providerName;
  }

  public getClusterPrefix() {
    return this.clusterPrefix;
  }

  public getDeploymentName() {
    return this.deploymentName;
  }

  public abstract getInputs();

  public abstract getParameters();

  public getApplication(): ApplicationDeployer {
    return this.application;
  }

  protected abstract initInputs(params: DeploymentConfigurationParameters);

  protected abstract initParameters(params: DeploymentConfigurationParameters);


  private initApplication(parameters: DeploymentConfigurationParameters): ApplicationDeployer {
    let app = <ApplicationDeployer> {
      name: 'Phenomenal VRE',
      accountUsername: parameters.username,
      repoUri: this.applicationRepoUrl,
      selectedCloudProvider: parameters.provider
    };
    app.attachedVolumes = {};
    app.assignedInputs = this.getInputs();
    app.assignedParameters = {};
    app.configurations = [];
    return app;
  }

  private static generateUIDNotMoreThan1million() {
    return ('000000' + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
  }

  private static generateName(): string {
    return 'phn' + BaseDeploymentConfigurationParameters.generateUIDNotMoreThan1million();
  }

  protected static JsonClone(obj) {
    return Object.assign({}, obj);
  }

}
