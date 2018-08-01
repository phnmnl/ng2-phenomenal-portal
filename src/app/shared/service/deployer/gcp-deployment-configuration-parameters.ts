import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";
import { OpenStackCredentials } from "../cloud-provider-metadata/OpenStackCredentials";
import { OpenStackMetadataService } from "../cloud-provider-metadata/open-stack-metadata.service";


export class GcpDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    node_count: '2',
    edgenode_count: '2',
    glusternode_count: '1',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90'
  };

  constructor(config?: object) {
    super(Object.assign(GcpDeploymentConfigurationParameters.defaults, config ? config : {}));
  }

  public get provider(): string {
    return "GCP";
  }

  public static get defaults(): object {
    return Object.assign({}, this.DEFAULT_INPUTS);
  }

  public get inputs() {
    return {
      cluster_prefix: this.clusterPrefix,
      gce_project: this.tenant_name,
      gce_zone: this.default_region,
      master_as_edge: this.master_as_edge,
      master_flavor: this.master_instance_type,
      node_flavor: this.node_instance_type,
      node_count: this.node_count,
      edge_count: this.edgenode_count,
      edge_flavor: this.edgenode_instance_type,
      glusternode_flavor: this.glusternode_instance_type,
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
        {'key': 'OS_USERNAME', 'value': this.username},
        {'key': 'OS_TENANT_NAME', 'value': this.tenant_name},
        {'key': 'OS_PROJECT_NAME', 'value': this.tenant_name},
        {'key': 'GOOGLE_CREDENTIALS', 'value': this.rc_file.replace(/\\n/g, '\\n')},
        {'key': 'GCE_ZONE', 'value': this.default_region},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': this.galaxy_admin_password},
      ]
    }
  }
}
