import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';
import { OpenStackCredentials } from "./OpenStackCredentials";
import { CloudProvider } from "../deployer/cloud-provider";
import { OpenStackMetadataService } from "./open-stack-metadata.service";
import { ICloudProviderMetadataService } from "./cloud-provider-metadata-service";
import { AwsMetadataService } from "./aws-metadata.service";
import { UnimplementedException } from "@angular-devkit/schematics";
import { GcpMetadataService } from "./gcp-metadata.service";


/**
 * Fetch OpenStack metadata from TSI portal API
 */
@Injectable()
export class CloudProviderMetadataService {

  private baseUrl: string;
  private headUrl: string;
  private metadataUrl = 'cloudprovidermetadata';


  private concreteMetadataService: ICloudProviderMetadataService;


  constructor(private http: Http,
              private tokenService: TokenService,
              private config: AppConfig,
              private openStackMetadataService: OpenStackMetadataService,
              private awsMetadataService: AwsMetadataService,
              private gcpMetadataService: GcpMetadataService
  ) {
    this.baseUrl = config.getConfig('tsi_portal_url');
    // this.baseUrl = 'http://localhost:8080/';

    this.metadataUrl = 'cloudprovidermetadata';
    this.headUrl = this.baseUrl + this.metadataUrl;
  }


  private getConcreteMetadataService(cloudProvider: CloudProvider): ICloudProviderMetadataService {
    if (cloudProvider.name === "aws")
      return this.awsMetadataService;
    else if (cloudProvider.name === "gcp")
      return this.gcpMetadataService;
    // default option
    return this.openStackMetadataService;
  }


  public authenticate(cloudProvider: CloudProvider): Observable<object> {
    return this.getConcreteMetadataService(cloudProvider).authenticate(cloudProvider);
  }

  public getRegions(cloudProvider: CloudProvider): Observable<any[]> {
    return this.getConcreteMetadataService(cloudProvider).getRegions();
  }


  public getFlavors(cloudProvider: CloudProvider): Observable<any[]> {
    return this.getConcreteMetadataService(cloudProvider).getFlavors();
  }

  public getExternalNetworks(cloudProvider: CloudProvider): Observable<any[]> {
    if (cloudProvider.name !== "ostack")
      return Observable.empty();
    return this.openStackMetadataService.getExternalNeworks();
  }

  public getFloatingIpPools(cloudProvider: CloudProvider): Observable<any[]> {
    if (cloudProvider.name !== "ostack")
      return Observable.empty();
    return this.openStackMetadataService.getFloatingIpPools();
  }
}
