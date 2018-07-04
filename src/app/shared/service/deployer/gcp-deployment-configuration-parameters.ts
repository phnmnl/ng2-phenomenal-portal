import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { DeploymentConfigurationParameters } from "../../../setup/deployment-configuration-parameters";

export class GcpDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    master_flavor: 'n1-standard-2',
    node_count: '2',
    node_flavor: 'n1-standard-2',
    glusternode_count: '1',
    glusternode_flavor: 'n1-standard-2',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90Gi'
  };

  private _inputs: object;
  private _parameters: object;


  constructor(parameters: DeploymentConfigurationParameters, applicationRepoUrl) {
    super(parameters, applicationRepoUrl);
  }

  public getDefaultInputs(): object {
    return Object.assign({}, GcpDeploymentConfigurationParameters.DEFAULT_INPUTS);
  }

  protected initInputs(parameters: DeploymentConfigurationParameters) {
    console.log("Default inputs", this.getDefaultInputs());
    this._inputs = Object.assign({}, {
      cluster_prefix: this.getClusterPrefix(),
      gce_project: parameters.tenant_name,
      gce_zone: parameters.default_region,
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
    this._parameters = {
      'name': this.getDeploymentName(),
      'cloudProvider': parameters.provider,
      'fields': [
        {'key': 'GOOGLE_CREDENTIALS', 'value': parameters.rc_file.replace(/\\n/g, '\\n')},
        {'key': 'GCE_PROJECT', 'value': parameters.tenant_name},
        {'key': 'GCE_ZONE', 'value': parameters.default_region},
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
