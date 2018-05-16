export class OpenStackCredentials {

  public username: string;
  public password: string;
  public authUrl: string;
  public tenantName: string;
  public projectName: string;
  public domainName: string;
  public rcFile: string;
  public rcVersion: string;


  constructor(username: string, password: string, authUrl: string,
              tenantName: string, projectName: string, domainName: string,
              rcFile: string, rcVersion: string) {
    this.username = username;
    this.password = password;
    this.authUrl = authUrl;
    this.tenantName = tenantName;
    this.projectName = projectName;
    this.domainName = domainName;
    this.rcFile = rcFile;
    this.rcVersion = rcVersion;
  }
}
