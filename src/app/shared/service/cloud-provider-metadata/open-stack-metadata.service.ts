import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';
import { OpenStackCredentials } from "./OpenStackCredentials";
import { ICloudProviderMetadataService } from "./cloud-provider-metadata-service";
import { CloudProvider } from "../deployer/cloud-provider";
import { Subject } from "rxjs";


/**
 * Fetch OpenStack metadata from TSI portal API
 */
@Injectable()
export class OpenStackMetadataService implements ICloudProviderMetadataService {

  private URL: string = "/api/v2/providers/openstack";
  private regionsSubject = new Subject<any>();
  private flavorsSubject = new Subject<any>();
  private externalNetworks = new Subject<any>();
  private floatingIpPools = new Subject<any>();

  constructor(private http: Http,
              private config: AppConfig) {
  }

  public authenticate(cloudProvider: CloudProvider): Observable<object> {
    let credentials: OpenStackCredentials =
      OpenStackMetadataService.parseRcFile(cloudProvider.parameters.rc_file, cloudProvider.parameters.password);
    let jsonCredentials = credentials.toJSON();

    //console.log("[DEBUG] authentication OpenStackCredentials: %O", credentials);
    //console.log("[DEBUG] authentication JSON credentials: %O", jsonCredentials);

    return this.http.post(this.URL + "/authenticate", jsonCredentials)
      .map((res) => {
        this.loadFlavors(jsonCredentials);
        this.loadExternalNetworks(jsonCredentials);
        this.loadFloatingIpPools(jsonCredentials);
        return res.json();
      }).catch(res => Observable.throw(res.json()));
  }

  getRegions(): Observable<any[]> {
    return this.regionsSubject.asObservable();
  }

  /**
   * Fetch all available flavors from OpenStack
   * @param {OpenstackConfig} config
   * @returns {Observable<string[]>}
   */
  getFlavors(): Observable<any[]> {
    return this.flavorsSubject.asObservable();
  }

  getExternalNeworks(): Observable<any[]> {
    return this.externalNetworks.asObservable();
  }

  getFloatingIpPools(): Observable<any[]> {
    return this.floatingIpPools.asObservable();
  }

  private loadFlavors(credentials) {
    this.http.post(this.URL + "/flavors", credentials).subscribe(
      (data) => {
        console.log(data);
        let flavors = data.json()["data"];
        console.log("Flavors", flavors);
        this.flavorsSubject.next(flavors['flavors']);
      },
      (error) => {
        console.error(error);
      });
  }

  private loadExternalNetworks(credentials) {
    this.http.post(this.URL + "/external-networks", credentials).subscribe(
      (data) => {
        console.log(data);
        let networks = data.json()["data"];
        console.log("Networks", networks);
        this.externalNetworks.next(networks['networks']);
      },
      (error) => {
        console.error(error);
      });
  }

  private loadFloatingIpPools(credentials) {
    this.http.post(this.URL + "/ip-pools", credentials).subscribe(
      (data) => {
        console.log(data);
        let ipPools = data.json()["data"];
        console.log("floating_ip_pools", ipPools);
        this.floatingIpPools.next(ipPools['floating_ip_pools']);
      },
      (error) => {
        console.error(error);
      });
  }

  public static updateRcFile(cloudProvider: CloudProvider, config: object) {
    if (!cloudProvider)
      throw new Error("Undefined Provider");
    if (!config)
      throw new Error("[updateRcFile] config not provided");

    if (!cloudProvider.parameters || !cloudProvider.parameters.rc_file)
      throw new Error("Unable to find parameters rc_file file");

    let cc: OpenStackCredentials = this.parseRcFile(cloudProvider.parameters.rc_file);

    let configToOsVar = {
      "authUrl": "OS_AUTH_URL",
      "domainName": "OS_USER_DOMAIN_NAME",
      "password": "OS_PASSWORD",
      "projectDomainId": "OS_PROJECT_DOMAIN_ID",
      "projectDomainName": "OS_PROJECT_DOMAIN_NAME",
      //"rcVersion": "OS_IDENTITY_API_VERSION", not settable
      "userDomainId": "OS_USER_DOMAIN_ID",
      "username": "OS_USERNAME",
      "volumeApiVersion": "OS_VOLUME_API_VERSION"
    };

    if (cc.rcVersion == "2") {
      configToOsVar["projectId"] = "OS_TENANT_ID";
      configToOsVar["projectName"] = "OS_TENANT_NAME";
    }
    else {
      configToOsVar["projectId"] = "OS_PROJECT_ID";
      configToOsVar["projectName"] = "OS_PROJECT_NAME";
    }

    for (let key of Object.keys(config)) {
      OpenStackMetadataService.setVarInCredentials(cc, configToOsVar[key], config[key]);
    }

    cloudProvider.parameters.rc_file = cc.rcFile;
  }

  private static setVarInCredentials(cred: OpenStackCredentials, varName: string, newValue: string): void {
    if (!cred || !varName)
      throw new Error("[ERROR]: setVarInCredentials got a bad parameter");

    // update rc file
    let re = new RegExp('(\\bexport\\s' + varName + '=).*');
    let result = null;
    if (cred.rcFile.search(re) >= 0)
      result = cred.rcFile.replace(re, "$1" + '"' + newValue + '"');
    else
      result = cred.rcFile + `\nexport ${varName}="${newValue}"\n`;
    cred.rcFile = result;

    // update vars
    cred.vars[varName] = newValue;

    // and finally the credential's properties
    if (varName == "OS_AUTH_URL")
      cred.authUrl = newValue;
    else if (varName == "OS_TENANT_ID" && cred.rcVersion == "2" || varName == "OS_PROJECT_ID" && cred.rcVersion == "3")
      cred.projectId = newValue;
    else if (varName == "OS_TENANT_NAME" && cred.rcVersion == "2" || varName == "OS_PROJECT_NAME" && cred.rcVersion == "3")
      cred.projectName = newValue;
    else if (varName == "OS_PASSWORD")
      cred.password = newValue;
    else if (varName == "OS_USERNAME")
      cred.username = newValue;
  }

  public static parseRcFile(rcFile: string, password?: string, username?: string): OpenStackCredentials {
    if (!rcFile)
      throw new Error("Undefined RC file");

    // remove all comments, echo and read commands
    rcFile = rcFile.replace(/#.*\n|^\s*\becho\b.+|^\s*\bread\b.+/gm, '');

    let rcVars = OpenStackMetadataService.extractVars(rcFile);

    // set the username if provided
    if (username) {
      rcVars["OS_USERNAME"] = username;
    } else {
      username = rcVars["OS_USERNAME"];
    }

    let authUrl     = rcVars["OS_AUTH_URL"] || "";
    let projectId   = rcVars["OS_PROJECT_ID"] || "";
    let projectName = rcVars["OS_PROJECT_NAME"] || "";
    let rcVersion   = rcVars["OS_IDENTITY_API_VERSION"] || "";
    let tenantId    = rcVars["OS_TENANT_ID"] || "";
    let tenantName  = rcVars["OS_TENANT_NAME"] || "";

    if (!authUrl)
      throw Error("OS_AUTH_URL missing from RC file!");

    // try to detect version from existing properties
    if (!rcVersion) {
      if (authUrl.search(/\bv3\b/) >= 0)
        rcVersion = "3";
      else if (authUrl.search(/\bv2\b/) >= 0)
        rcVersion = "2";
      else if (projectName)
        rcVersion = "3";
      else {
        console.log("Unable to find API version number.  Defaulting to v2");
        rcVersion = "2";
      }
    }

    rcVars["OS_IDENTITY_API_VERSION"] = rcVersion;

    if (rcVersion == "2") {
      projectName = tenantName;
      projectId = tenantId;
    }

    let cc = new OpenStackCredentials(
      authUrl,
      password,
      projectId,
      projectName,
      rcFile,
      rcVersion,
      username,
      rcVars);

    if (password) {
      // before returning the credentials, don't forget to set the password
      // with the overriding value we received as a parameter
      OpenStackMetadataService.setVarInCredentials(cc, "OS_PASSWORD", password);
    }
    return cc;
  }

  /* returns a k-v map */
  public static extractVars(rcFile: string): object {
    let result = {};
    let pattern = /^\s*\bexport\s+(\w+)=(.*)/;
    let match = null;

    let lines = rcFile.split('\n');
    for (let i = 0; i < lines.length; ++i) {
      match = pattern.exec(lines[i]);
      if (match) {
        result[match[1]] = match[2].replace(/['"]/g, "");
      }
    }

    return result;
  }
}
