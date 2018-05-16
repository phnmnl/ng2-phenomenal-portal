import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';
import { OpenStackCredentials } from "./OpenStackCredentials";


/**
 * Fetch OpenStack metadata from TSI portal API
 */
@Injectable()
export class CloudProviderMetadataService {

  private baseUrl: string;
  private headUrl: string;
  private metadataUrl = 'cloudprovidermetadata';

  constructor(private http: Http,
              private tokenService: TokenService,
              private config: AppConfig) {
    this.baseUrl = config.getConfig('tsi_portal_url');
    // this.baseUrl = 'http://localhost:8080/';

    this.metadataUrl = 'cloudprovidermetadata';
    this.headUrl = this.baseUrl + this.metadataUrl;
  }

  /**
   * Fetch all available flavors from OpenStack
   * @param {OpenstackConfig} config
   * @returns {Observable<string[]>}
   */
  getFlavors(config: OpenstackConfig): Observable<string[]> {

    const body = this.getBody(config);
    const options = new RequestOptions({headers: this.getHeader()});

    return this.http.post(this.headUrl + '/flavors', body, options).map(res => res.json());
  }

  /**
   * Fetch all available networks from OpenStack
   * @param {OpenstackConfig} config
   * @returns {Observable<string[]>}
   */
  getNetworks(config: OpenstackConfig): Observable<string[]> {

    const body = this.getBody(config);
    const options = new RequestOptions({headers: this.getHeader()});

    return this.http.post(this.headUrl + '/networks', body, options).map(res => res.json());
  }

  /**
   * Fetch all available IP pools from OpenStack
   * @param {OpenstackConfig} config
   * @returns {Observable<string[]>}
   */
  getIPPools(config: OpenstackConfig): Observable<string[]> {
    const body = this.getBody(config);
    const options = new RequestOptions({headers: this.getHeader()});

    return this.http.post(this.headUrl + '/ippools', body, options).map(res => res.json());
  }

  private getHeader() {

    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.tokenService.getToken().token);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  private getBody(config: OpenstackConfig) {
    const body = JSON.stringify('{"username": "' + config.username + '", "password": "' + config.password
      + '", "tenantName": "' + config.tenantName + '", "domainName": "' + config.domainName + '", "endpoint": "'
      + config.endpoint + '", "version": "' + config.version + '"}');
    return body;
  }


  public parseRcFile(rcFile: string, password: string): OpenStackCredentials {
    if (rcFile) {


      // update RC file with the user password and set it as current RC file
      // console.log("The current RC file...", rcFile);
      rcFile = rcFile.replace(/#.*\n/, '');         // remove all comments
      rcFile = rcFile.replace(/\becho\b.+\n/, '');      // remove all echo commands
      rcFile = rcFile.replace(/\bread\b.+\n/, '');  // remove the read command
      rcFile = rcFile.replace(/(\bexport OS_PASSWORD=)(.*)/,          // set the password
        "$1" + '"' + password + '"');


      // extract all the required RC file fields required to query the TSI portal
      let rcVersion = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_IDENTITY_API_VERSION");
      let username = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_USERNAME");
      let authUrl = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_AUTH_URL");
      let tenantName = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_TENANT_NAME");
      let projectName = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_PROJECT_NAME");
      let domainName = CloudProviderMetadataService.extractPropertyValue(rcFile, "OS_USER_DOMAIN_NAME");

      // detect version from existing properties
      if (!rcVersion) {
        rcVersion = projectName ? "3" : "2";
      }

      return <OpenStackCredentials>{
        username: username,
        password: password,
        authUrl: authUrl,
        tenantName: tenantName,
        projectName: projectName,
        domainName: domainName,
        rcFile: rcFile,
        rcVersion: rcVersion
      };
    }
  }

  private static extractPropertyValue(rcFile: string, propertyName: string): string {
    let match;
    let result: string = null;
    let pattern = new RegExp(propertyName + "=(.+)");

    // extract property
    if (rcFile) {
      if ((match = pattern.exec(rcFile)) !== null) {
        result = match[1].replace(/\"/g, "");
      }
    }
    return result;
  }
}
