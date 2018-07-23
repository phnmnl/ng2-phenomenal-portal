import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";

export class AwsDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    master_instance_type: 't2.xlarge',
    node_count: '2',
    node_instance_type: 't2.xlarge',
    edgenode_count: '2',
    edgenode_instance_type: 't2.medium',
    glusternode_count: '1',
    glusternode_instance_type: 't2.xlarge',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90'
  };

  constructor(config?: object) {
    super(Object.assign(AwsDeploymentConfigurationParameters.defaults, config ? config : {}));
  }

  get provider(): string {
    return "AWS";
  }

  public static get defaults(): object {
    return Object.assign({}, this.DEFAULT_INPUTS);
  }

  public get inputs() {
    return {
      cluster_prefix: this._clusterPrefix,
      availability_zone: this.default_region + 'b', // TODO: check availability zones
      master_as_edge: this.master_as_edge,
      master_instance_type: this.master_instance_type,
      node_instance_type: this.node_instance_type,
      node_count: this.node_count,
      edge_instance_type: this.edgenode_instance_type,
      edge_count: this.edgenode_count,
      glusternode_instance_type: this.glusternode_instance_type,
      glusternode_count: this.glusternode_count,
      glusternode_extra_disk_size: this.glusternode_extra_disk_size,
      phenomenal_pvc_size: this.phenomenal_pvc_size + "Gi",
      galaxy_admin_email: this.galaxy_admin_email,
      galaxy_admin_password: this.galaxy_admin_password
    }
  }

  public get parameters() {
    return {
      'name': this.deploymentName,
      'cloudProvider': this.provider,
      'fields': [
        {'key': 'TF_VAR_aws_access_key_id', 'value': this.access_key_id},
        {'key': 'TF_VAR_aws_secret_access_key', 'value': this.secret_access_key},
        {'key': 'TF_VAR_aws_region', 'value': this.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': this.galaxy_admin_password}
      ]
    }
  }
}
