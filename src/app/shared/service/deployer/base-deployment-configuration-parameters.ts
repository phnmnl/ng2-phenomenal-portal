import { ApplicationDeployer } from "ng2-cloud-portal-presentation-lib/dist";

export abstract class BaseDeploymentConfigurationParameters {
  username: string;
  password: string;
  _clusterPrefix: string;
  tenant_name: string;
  url: string;
  private _provider: string;
  galaxy_admin_username: string;
  galaxy_admin_email: string;
  galaxy_admin_password: string;
  jupyter_password: string;
  access_key_id?: string;
  secret_access_key?: string;
  default_region?: string;
  network?: string;
  ip_pool?: string;
  rc_file?: string;
  preconfigured?: boolean = false;
  preset?: string = null;

  master_as_edge: boolean = true;
  master_instance_type: string;
  node_count: number = 2;
  node_instance_type: string;
  glusternode_count: number = 1;
  edgenode_count: number = 2;
  edgenode_instance_type: string;
  glusternode_instance_type: string;
  glusternode_extra_disk_size: number = 100;
  phenomenal_pvc_size: number = 100;
  phenomenal_version = {
    id: "",
    name: "",
    url: ""
  };


  protected constructor(config?: object) {
    if (config)
      for (let p of Object.keys(config)) {
        this[p] = config[p];
      }
  }

  public get clusterPrefix(): string {
    if (!this._clusterPrefix)
      this._clusterPrefix = BaseDeploymentConfigurationParameters.generateName();
    return this._clusterPrefix;
  }


  public get provider(): string {
    return this._provider;
  }

  public get deploymentName(): string {
    return this.clusterPrefix + "-" + this.provider;
  }

  private application: ApplicationDeployer;

  public getApplication(): ApplicationDeployer {
    if (!this.application) {
      let app = <ApplicationDeployer> {
        name: 'Phenomenal VRE ' + this.phenomenal_version.id,
        accountUsername: this.username,
        repoUri: this.phenomenal_version.url,
        selectedCloudProvider: this.provider
      };
      app.attachedVolumes = {};
      app.assignedInputs = this.inputs;

      // if master_as_edge is set then make sure edge_count is 0.  Some versions of kubenow
      // interpret master_as_edge as adding one more edge service (on the master) in addition
      // to the specified edge_count
      if (app.assignedInputs.master_as_edge)
        app.assignedInputs.edge_count = '0';

      app.assignedParameters = {};
      app.configurations = [];
      this.application = app;
    }
    return this.application;
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

  public abstract get inputs();

  public abstract get parameters();
}
