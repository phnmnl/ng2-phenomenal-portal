export class OpenstackConfig {
  username: string;
  password: string;
  tenantName: string;
  domainName: string;
  endpoint: string;
  version: string;

  constructor(username: string, password: string,
              tenantName: string, domainName: string,
              endpoint: string, version: string) {
    this.username = username;
    this.password = password;
    this.tenantName = tenantName;
    this.domainName = domainName;
    this.endpoint = endpoint;
    this.version = version;
  }
}
