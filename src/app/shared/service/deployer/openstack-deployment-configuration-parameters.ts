import { OpenStackCredentials } from "../cloud-provider-metadata/OpenStackCredentials";
import { OpenStackMetadataService } from "../cloud-provider-metadata/open-stack-metadata.service";
import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";


export class OpenstackDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    node_count: '2',
    glusternode_count: '1',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90'
  };

  constructor(config?: object) {
    super(Object.assign(OpenstackDeploymentConfigurationParameters.defaults, config ? config : {}));
  }

  public get provider(): string {
    return "OSTACK";
  }

  public static get defaults(): object {
    return Object.assign({}, this.DEFAULT_INPUTS);
  }

  public get inputs() {
    let inputs = {
      cluster_prefix: this.clusterPrefix,
      floating_ip_pool: this.ip_pool,
      external_network_uuid: this.network,
      master_as_edge: this.master_as_edge,
      master_flavor: this.master_instance_type,
      node_flavor: this.node_instance_type,
      node_count: this.node_count,
      glusternode_flavor: this.glusternode_instance_type,
      glusternode_count: this.glusternode_count,
      glusternode_extra_disk_size: this.glusternode_extra_disk_size,
      phenomenal_pvc_size: this.phenomenal_pvc_size + "Gi",
      galaxy_admin_email: this.galaxy_admin_email,
      galaxy_admin_password: this.galaxy_admin_password,
      preconfigured: this.preconfigured
    };
    if (this.preconfigured)
      inputs["preset"] = this.preset;
    return inputs;
  }

  public get parameters() {
    let cc: OpenStackCredentials = OpenStackMetadataService.parseRcFile(this.rc_file, this.password);
    return {
      'name': this.deploymentName,
      'cloudProvider': this.provider,
      'fields': [
        {'key': 'OS_USERNAME', 'value': this.username},
        {'key': 'OS_TENANT_NAME', 'value': this.tenant_name},
        {'key': 'OS_AUTH_URL', 'value': this.url},
        {'key': 'OS_PASSWORD', 'value': this.password},
        {'key': 'OS_PROJECT_NAME', 'value': this.tenant_name},
        {'key': 'OS_RC_FILE', 'value': btoa(cc.rcFile)},
        {'key': 'TF_VAR_galaxy_admin_email', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_galaxy_admin_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_jupyter_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_dashboard_username', 'value': this.galaxy_admin_email},
        {'key': 'TF_VAR_dashboard_password', 'value': this.galaxy_admin_password},
        {'key': 'TF_VAR_floating_ip_pool', 'value': this.ip_pool},
        {'key': 'TF_VAR_external_network_uuid', 'value': this.network}
      ]
    }
  }
}
