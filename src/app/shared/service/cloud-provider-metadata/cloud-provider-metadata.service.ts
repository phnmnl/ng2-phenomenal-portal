import { Injectable } from '@angular/core';
import {Http, Headers, Response, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { ConfigService, TokenService } from 'ng2-cloud-portal-service-lib';

@Injectable()
export class CloudProviderMetadataService {

  private baseUrl: string;
  private metadataUrl: string;
  private headUrl: string;

  constructor(
    private http: Http,
    private tokenService: TokenService,
    private _configService: ConfigService
) {
    this.baseUrl = 'http://localhost:8080/';
    // this.baseUrl = _configService.getApiAddress();
    this.metadataUrl = 'cloudprovidermetadata';
    this.headUrl = this.baseUrl + this.metadataUrl;
  }


  getFlavors(username, password, tenantName, domainName, endpoint, version): Observable<string[]>  {

    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.tokenService.getToken().token);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify('{"username": "' + username + '", "password": "' + password + '", "tenantName": "' + tenantName + '", "domainName": "' + domainName + '", "endpoint": "' + endpoint + '", "version": "' + version + '"}');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.headUrl + '/flavors', body, options).map(res => res.json());
  }

  getNetworks(username, password, tenantName, domainName, endpoint, version): Observable<string[]>  {

    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.tokenService.getToken().token);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify('{"username": "' + username + '", "password": "' + password + '", "tenantName": "' + tenantName + '", "domainName": "' + domainName + '", "endpoint": "' + endpoint + '", "version": "' + version + '"}');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.headUrl + '/networks', body, options).map(res => res.json());
  }

  getIPPools(username, password, tenantName, domainName, endpoint, version): Observable<string[]>  {

    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.tokenService.getToken().token);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify('{"username": "' + username + '", "password": "' + password + '", "tenantName": "' + tenantName + '", "domainName": "' + domainName + '", "endpoint": "' + endpoint + '", "version": "' + version + '"}');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.headUrl + '/ippools', body, options).map(res => res.json());
  }

}
