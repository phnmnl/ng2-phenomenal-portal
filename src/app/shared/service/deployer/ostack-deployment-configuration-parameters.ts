import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { DeploymentConfigurationParameters } from "../../../setup/deployment-configuration-parameters";
import { OpenStackMetadataService } from "../cloud-provider-metadata/open-stack-metadata.service";
import { OpenStackCredentials } from "../cloud-provider-metadata/OpenStackCredentials";

export class OstackDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    node_count: '2',
    glusternode_count: '1',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90Gi'
  };

  private _inputs: object;
  private _parameters: object;


  constructor(parameters: DeploymentConfigurationParameters, applicationRepoUrl) {
    super(parameters, applicationRepoUrl);
  }

  public getDefaultInputs(): object {
    return Object.assign({}, OstackDeploymentConfigurationParameters.DEFAULT_INPUTS);
  }

  protected initInputs(parameters: DeploymentConfigurationParameters) {
    console.log("Default inputs", this.getDefaultInputs());
    this._inputs = Object.assign({}, {
      cluster_prefix: this.getClusterPrefix(),
      floating_ip_pool: parameters.ip_pool,
      external_network_uuid: parameters.network,
      master_as_edge: parameters.master_as_edge,
      master_flavor: parameters.master_instance_type,
      node_flavor: parameters.node_instance_type,
      node_count: parameters.node_count,
      glusternode_flavor: parameters.gluster_instance_type,
      glusternode_count: parameters.gluster_count,
      glusternode_extra_disk_size: parameters.gluster_extra_disk_size,
      phenomenal_pvc_size: parameters.pvc_size + "Gi",
      galaxy_admin_email: parameters.galaxy_admin_email,
      galaxy_admin_password: parameters.galaxy_admin_password
    });
  }

  protected initParameters(parameters: DeploymentConfigurationParameters) {
    let cc: OpenStackCredentials = OpenStackMetadataService.parseRcFile(parameters.rc_file, parameters.password);
    this._parameters = {
      'name': this.getDeploymentName(),
      'cloudProvider': parameters.provider,
      'fields': [
        {'key': 'OS_USERNAME', 'value': parameters.username},
        {'key': 'OS_TENANT_NAME', 'value': parameters.tenant_name},
        {'key': 'OS_AUTH_URL', 'value': parameters.url},
        {'key': 'OS_PASSWORD', 'value': parameters.password},
        {'key': 'OS_PROJECT_NAME', 'value': parameters.tenant_name},
        {'key': 'OS_RC_FILE', 'value': btoa(cc.rcFile)},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': parameters.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': parameters.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': parameters.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': parameters.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': parameters.galaxy_admin_password},
        {'key': 'TF_VAR_floating_ip_pool', 'value': parameters.ip_pool},
        {'key': 'TF_VAR_external_network_uuid', 'value': parameters.network}
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
