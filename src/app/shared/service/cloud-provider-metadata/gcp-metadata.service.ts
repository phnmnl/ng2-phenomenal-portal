import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { AppConfig } from '../../../app.config';
import { OpenstackConfig } from './openstack-config';
import { OpenStackCredentials } from "./OpenStackCredentials";
import { ICloudProviderMetadataService } from "./cloud-provider-metadata-service";
import { CloudProvider } from "../../../setup/cloud-provider";

import AWS = require('aws-sdk');
import { AWSError } from "aws-sdk/lib/error";
import { Subject } from "rxjs";

/**
 * Fetch OpenStack metadata from TSI portal API
 */
@Injectable()
export class GcpMetadataService implements ICloudProviderMetadataService {

  private regionsSubject = new Subject<any>();
  private flavorsSubject = new Subject<any>();
  private URL: string = "/api/v2/providers/gcp";

  constructor(private http: Http,
              private config: AppConfig) {
    this.loadRegions(null);
  }


  private static getCredentials(cloudProvider: CloudProvider) {
    let credentials = cloudProvider.credential;
    console.log("Credentials", credentials);
    return JSON.parse(credentials.rc_file);
  }

  public authenticate(cloudProvider: CloudProvider): Observable<object> {
    let credentials = GcpMetadataService.getCredentials(cloudProvider);
    return this.http.post(this.URL + "/authenticate", credentials)
      .map((res) => {
        this.loadRegions(credentials);
        this.loadFlavors(credentials);
        return res.json();
      }).catch(res => Observable.throw(res.json()));
  }

  getRegions(): Observable<any[]> {
    return this.regionsSubject.asObservable();
  }

  getFlavors(): Observable<any[]> {
    return this.flavorsSubject.asObservable();
  }

  public loadRegions(credentials) {
    this.regionsSubject.next([
      {value: 'us-west1-a', displayValue: 'Western US'},
      {value: 'us-central1-a', displayValue: 'Central US'},
      {value: 'us-east1-b', displayValue: 'Eastern US'},
      {value: 'europe-west1-b', displayValue: 'Western Europe'},
      {value: 'asia-east1-a', displayValue: 'Eastern Asia-Pacific'},
      {value: 'asia-northeast1-a', displayValue: 'Northeastern Asia-Pacific'}
    ]);
  }

  private loadFlavors(credentials) {
    this.http.post(this.URL + "/flavors", credentials).subscribe(
      (data) => {
        console.log(data);
        let flavors = data.json()["data"]["items"];
        console.log("Flavors", flavors);
        this.flavorsSubject.next(flavors);
      },
      (error) => {
        console.error(error);
      });
  }

  public authenticateX(cloudProvider: CloudProvider): Observable<object> {
    let credentials = cloudProvider.credential;
    console.log("Credentials", credentials);
    if (credentials.default_region && credentials.access_key_id && credentials.secret_access_key) {
      AWS.config.update({
        region: credentials.default_region,
        // accessKeyId: credentials.access_key_id,
        // secretAccessKey: credentials.secret_access_key
      });

      // Validate AWS credentials trying to get the list of instances from the AWS EC2 service
      // Check whether there exists a specific API method to validate credentials
      let ec2 = new AWS.EC2();


      return Observable.create((observer) => {
        ec2.describeRegions({}, (err: AWSError, data) => {
          if (err) {
            observer.error(err);
            observer.complete();
          } else {
            console.log("Instances", data);
            observer.next(data);
            observer.complete();
          }
        });
      });
    }
  }

  private extractProjectName(credentialsText): string {
    let projectName = null;
    if (credentialsText) {
      let credentials = JSON.parse(credentialsText);
      if (credentials) {
        projectName = credentials.project_id;
      }
    }
    return projectName;
  }
}
