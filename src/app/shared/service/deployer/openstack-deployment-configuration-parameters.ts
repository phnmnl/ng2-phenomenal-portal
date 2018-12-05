import { OpenStackCredentials } from "../cloud-provider-metadata/OpenStackCredentials";
import { OpenStackMetadataService } from "../cloud-provider-metadata/open-stack-metadata.service";
import { BaseDeploymentConfigurationParameters } from "./base-deployment-configuration-parameters";


export class OpenstackDeploymentConfigurationParameters extends BaseDeploymentConfigurationParameters {

  private static DEFAULT_INPUTS = {
    master_as_edge: 'true',
    node_count: '2',
    glusternode_count: '1',
    edgenode_count: '2',
    glusternode_extra_disk_size: '100',
    phenomenal_pvc_size: '90',
    use_floating_IPs: true,
    private_network_name: ''
  };

  constructor(config?: object) {
    super(Object.assign(OpenstackDeploymentConfigurationParameters.defaults, config ? config : {}));
    // Convert the value of use_floating_IPs to boolean assigned through `config` (we know
    // DEFAULT_INPUTS["use_floating_IPs"] is boolean).
    // TypeScript seems to let you happily assign a string if it comes from an untyped attribed,
    // which causes problems for us later.
    if ("use_floating_IPs" in config && config["use_floating_IPs"] !== undefined)
      this.use_floating_IPs = BaseDeploymentConfigurationParameters.toBoolean(config["use_floating_IPs"]);
    else
      this.use_floating_IPs = OpenstackDeploymentConfigurationParameters.DEFAULT_INPUTS["use_floating_IPs"];
    // The same should be done for the other boolean members of this class, but we're afraid to touch them :-)
  }

  public get provider(): string {
    return "OSTACK";
  }

  public static get defaults(): object {
    return Object.assign({}, this.DEFAULT_INPUTS);
  }

  public get inputs() {
    let inputs = {
      cluster_prefix: this.sanitize(this.clusterPrefix),
      floating_ip_pool: this.sanitize(this.ip_pool),
      external_network_uuid: this.sanitize(this.network),
      master_as_edge: this.sanitize(this.master_as_edge),
      master_flavor: this.sanitize(this.master_instance_type),
      node_flavor: this.sanitize(this.node_instance_type),
      node_count: this.sanitize(this.node_count),
      edge_count: this.sanitize(this.edgenode_count),
      edge_flavor: this.sanitize(this.edgenode_instance_type),
      glusternode_flavor: this.sanitize(this.glusternode_instance_type),
      glusternode_count: this.sanitize(this.glusternode_count),
      glusternode_extra_disk_size: this.sanitize(this.glusternode_extra_disk_size),
      phenomenal_pvc_size: this.sanitize(this.phenomenal_pvc_size + "Gi"),
      galaxy_admin_email: this.sanitize(this.galaxy_admin_email),
      galaxy_admin_password: this.sanitize(this.galaxy_admin_password),
      preconfigured: this.sanitize(this.preconfigured)
    };
    if (this.preconfigured)
      inputs["preset"] = this.preset;
    return inputs;
  }

  public get parameters(): object {
    let cc: OpenStackCredentials = OpenStackMetadataService.parseRcFile(this.rc_file, this.password);


    /*** Remember :-)
     * If the user sets OS_PROJECT_NAME and not OS_PROJECT_ID (this can happen
     * with partner providers) the deployment will fail unless the RC file
     * specifies OS_PROJECT_DOMAIN_NAME.
     */
    if (!cc.vars["OS_PROJECT_ID"] && cc.vars["OS_PROJECT_NAME"] && !cc.vars["OS_PROJECT_DOMAIN_NAME"])
      console.warn("Deployment specifies OS_PROJECT_NAME (%s) without OS_PROJECT_ID nor OS_PROJECT_DOMAIN_NAME", cc.vars["OS_PROJECT_NAME"]);

    //console.log("[DEBUG]: ===== Deployment credentials object: %O", cc);

    let fields = [];
    for (let k of Object.keys(cc.vars)) {
      if (cc.vars[k] != null)
        fields.push( {'key': k, 'value': this.sanitize(cc.vars[k])} );
    }
    fields.push({'key': 'OS_RC_FILE', 'value': btoa(cc.rcFile)});
    fields.push({'key': 'TF_VAR_galaxy_admin_email', 'value': this.sanitize(this.galaxy_admin_email)});
    fields.push({'key': 'TF_VAR_galaxy_admin_password', 'value': this.sanitize(this.galaxy_admin_password)});
    fields.push({'key': 'TF_VAR_jupyter_password', 'value': this.sanitize(this.galaxy_admin_password)});
    fields.push({'key': 'TF_VAR_dashboard_username', 'value': this.sanitize(this.galaxy_admin_email)});
    fields.push({'key': 'TF_VAR_dashboard_password', 'value': this.sanitize(this.galaxy_admin_password)});
    fields.push({'key': 'TF_VAR_floating_ip_pool', 'value': this.sanitize(this.ip_pool)});
    fields.push({'key': 'TF_VAR_external_network_uuid', 'value': this.sanitize(this.network)});
    fields.push({'key': 'TF_VAR_use_external_net', 'value': this.sanitize(String(!this.use_floating_IPs))});
    fields.push({'key': 'TF_VAR_network_name', 'value': this.sanitize(this.private_network_name)});

    let result = {
      'name': this.deploymentName,
      'cloudProvider': this.provider,
      'fields': fields
    };

    //console.log("[DEBUG]: ===== Deployment rcFile ====\n%O", cc.rcFile);
    //console.log("[DEBUG]: ===== Deployment parameters ====\n%O", result);

    return result;
  }

  private sanitize(value): string {
    if (value === undefined || value === null)
      return '';
    else
      return String(value);
  }
}
