export class OpenStackCredentials {

  public authUrl: string;
  public password: string;
  public projectId: string;
  public projectName: string;
  public rcFile: string;
  public rcVersion: string;
  public username: string;
  public vars: object;


  constructor(authUrl: string,
              password: string,
              projectId: string,
              projectName: string,
              rcFile: string,
              rcVersion: string,
              username: string,
              vars: object) {
    if (rcVersion != "2" && rcVersion != "3")
      throw new Error("Incompatible rcVersion ${rcVersion}");

    this.authUrl = authUrl;
    this.password = password;
    this.projectId = projectId;
    this.projectName = projectName;
    this.rcFile = rcFile;
    this.rcVersion = rcVersion;
    this.username = username;
    this.vars = vars;
  }

  get projectOrTenantName(): string {
    return this.projectName;
  }
  get domainName(): string {
    return this.vars["OS_USER_DOMAIN_NAME"] || "";
  }

  get tenantOrProjectName(): string{
    return this.projectName;
  }

  get tenantOrProjectId(): string {
    return this.projectId;
  }

  get authorizationEndPoint(): string {
    return this.authUrl;
  }

  public isV2(): boolean {
    return this.rcVersion === "2";
  }

  public isV3(): boolean {
    return !this.isV2();
  }

  public toJSON(): object {
    let result = {};
    for (let k of Object.keys(this.vars)) {
      if (this.vars[k]) // only set variables with a value
        result[k] = this.vars[k];
    }

    result["OS_AUTH_URL"] = this.authUrl;
    result["OS_IDENTITY_API_VERSION"] = this.rcVersion;
    result["OS_PASSWORD"] = this.password;
    result["OS_USERNAME"] = this.username;

    if (this.isV2()) {
      result["OS_TENANT_ID"] = this.projectId;
      result["OS_TENANT_NAME"] = this.projectName;
    } else if (this.isV3()) {
      result["OS_PROJECT_ID"] = this.projectId;
      result["OS_PROJECT_NAME"] = this.projectName;
    } else {
      throw new Error("Unsupported RC File version");
    }

    return result;
  }
}
