export class DeploymentConfigurationParameters {
  username: string;
  password: string;
  tenant_name: string;
  url: string;
  provider: string;
  galaxy_admin_username: string;
  galaxy_admin_email: string;
  galaxy_admin_password: string;
  jupyter_password: string;
  access_key_id?: string;
  secret_access_key?: string;
  default_region?: string;
  flavor?: string;
  network?: string;
  ip_pool?: string;
  rc_file?: string;
  master_as_edge: boolean = true;
  master_instance_type: string;
  node_count: number = 2;
  node_instance_type: string;
  gluster_count: number = 1;
  gluster_instance_type: string;
  gluster_extra_disk_size: number = 100;
  pvc_size: number = 100;
  phenomenal_version: string = "latest";
}
