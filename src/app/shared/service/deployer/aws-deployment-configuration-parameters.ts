import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { DeploymentConfigurationParameters } from "../../../setup/deployment-configuration-parameters";

export class AwsDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    master_instance_type: 't2.xlarge',
    node_count: '2',
    node_instance_type: 't2.xlarge',
    glusternode_count: '1',
    glusternode_instance_type: 't2.xlarge',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90Gi'
  };

  private _inputs: object;
  private _parameters: object;


  constructor(parameters: DeploymentConfigurationParameters, applicationRepoUrl) {
    super(parameters, applicationRepoUrl);
  }

  public getDefaultInputs(): object {
    return Object.assign({}, AwsDeploymentConfigurationParameters.DEFAULT_INPUTS);
  }

  protected initInputs(parameters: DeploymentConfigurationParameters) {
    console.log("Default inputs", this.getDefaultInputs());
    this._inputs = Object.assign({}, {
      cluster_prefix: this.getClusterPrefix(),
      availability_zone: parameters.default_region + 'b',
      galaxy_admin_email: parameters.galaxy_admin_email,
      galaxy_admin_password: parameters.galaxy_admin_password
    }, this.getDefaultInputs());
  }

  protected initParameters(parameters: DeploymentConfigurationParameters) {
    this._parameters = {
      'name': this.getDeploymentName(),
      'cloudProvider': parameters.provider,
      'fields': [
        {'key': 'TF_VAR_aws_access_key_id', 'value': parameters.access_key_id},
        {'key': 'TF_VAR_aws_secret_access_key', 'value': parameters.secret_access_key},
        {'key': 'TF_VAR_aws_region', 'value': parameters.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': parameters.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': parameters.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': parameters.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': parameters.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': parameters.galaxy_admin_password}
      ]
    }
  }

  getInputs() {
    return this._inputs;
  }

  getParameters() {
    return this._parameters;
  }
}
