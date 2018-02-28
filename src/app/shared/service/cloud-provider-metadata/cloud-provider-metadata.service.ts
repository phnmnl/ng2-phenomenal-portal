import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';


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

}
