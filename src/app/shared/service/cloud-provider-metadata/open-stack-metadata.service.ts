import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';
import { OpenStackCredentials } from "./OpenStackCredentials";
import { ICloudProviderMetadataService } from "./cloud-provider-metadata-service";
import { CloudProvider } from "../../../setup/cloud-provider";
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
      OpenStackMetadataService.parseRcFile(cloudProvider.credential.rc_file, cloudProvider.credential.password);
    let jsonCredentials = credentials.toJSON();
    console.log("Credentials object", credentials);
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

  getFloaingIpPools(): Observable<any[]> {
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

  public getTenantOrProjectName(cloudProvider: CloudProvider) {
    let rcFile = cloudProvider.credential.rc_file;
    let tenantName = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_TENANT_NAME");
    if (!tenantName || tenantName.length === 0)
      return OpenStackMetadataService.extractPropertyValue(rcFile, "OS_PROJECT_NAME");
  }

  public getAuthorizationEndPoint(cloudProvider: CloudProvider) {
    return OpenStackMetadataService.extractPropertyValue(cloudProvider.credential.rc_file, "OS_AUTH_URL");
  }


  public parseRcFile(rcFile: string, password: string): OpenStackCredentials {
    return OpenStackMetadataService.parseRcFile(rcFile, password);
  }

  public static parseRcFile(rcFile: string, password: string): OpenStackCredentials {
    if (rcFile) {
      // update RC file with the user password and set it as current RC file
      // console.log("The current RC file...", rcFile);
      rcFile = rcFile.replace(/#.*\n/g, '');          // remove all comments
      rcFile = rcFile.replace(/\becho\b.+/g, '');     // remove all echo commands
      rcFile = rcFile.replace(/\bread\b.+/g, '');     // remove the read command
      rcFile = rcFile.replace(/(\bexport OS_PASSWORD=)(.*)/,      // set the password
        "$1" + '"' + password + '"');

      // extract all the required RC file fields required to query the TSI portal
      let rcVersion = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_IDENTITY_API_VERSION");
      let username = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_USERNAME");
      let authUrl = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_AUTH_URL");
      let tenantName = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_TENANT_NAME");
      let tenantId = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_TENANT_ID");
      let projectName = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_PROJECT_NAME");
      let domainName = OpenStackMetadataService.extractPropertyValue(rcFile, "OS_USER_DOMAIN_NAME");

      // detect version from existing properties
      if (!rcVersion) {
        rcVersion = projectName ? "3" : "2";
      }

      return new OpenStackCredentials(
        username, password,
        authUrl,
        tenantId, tenantName,
        projectName, domainName,
        rcFile,
        rcVersion ? rcVersion : (projectName ? "3" : "2")
      );
    }
  }

  private static extractPropertyValue(rcFile: string, propertyName: string): string {
    let match;
    let result: string = null;
    let pattern = new RegExp(propertyName + "=(.+)", 'g');

    // extract property
    if (rcFile) {
      // search for all matches and use only the last one
      do {
        match = pattern.exec(rcFile);
        if (match) {
          // remove single and double quotes
          result = match[1].replace(/['"]/g, "");
        }
      } while (match);
    }
    return result;
  }
}
