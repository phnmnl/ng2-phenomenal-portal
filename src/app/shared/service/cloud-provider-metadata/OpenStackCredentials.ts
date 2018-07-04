export class OpenStackCredentials {

  public username: string;
  public password: string;
  public authUrl: string;
  public tenantId: string;
  public tenantName: string;
  public projectName: string;
  public userDomainName: string;
  public rcFile: string;
  public rcVersion: string;


  constructor(username: string, password: string, authUrl: string,
              tenantId: string, tenantName: string,
              projectName: string, userDomainName: string,
              rcFile: string, rcVersion: string) {
    this.username = username;
    this.password = password;
    this.authUrl = authUrl;
    this.tenantId = tenantId;
    this.tenantName = tenantName;
    this.projectName = projectName;
    this.userDomainName = userDomainName;
    this.rcFile = rcFile;
    this.rcVersion = rcVersion;
  }

  public isV2(): boolean {
    return this.rcVersion === "2";
  }

  public isV3(): boolean {
    return !this.isV2();
  }

  public toJSON() {
    if (this.isV2()) {
      return {
        "OS_AUTH_URL": this.authUrl,
        "OS_USERNAME": this.username,
        "OS_PASSWORD": this.password,
        "OS_TENANT_ID": this.tenantId
      }
    } else if (this.isV3()) {
      return {
        "OS_AUTH_URL": this.authUrl,
        "OS_USERNAME": this.username,
        "OS_PASSWORD": this.password,
        "OS_PROJECT_NAME": this.projectName,
        "OS_USER_DOMAIN_NAME": this.userDomainName
      }
    }
    throw new Error("Unsupported RC File version");
  }
}
