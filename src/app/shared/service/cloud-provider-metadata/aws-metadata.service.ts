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
export class AwsMetadataService implements ICloudProviderMetadataService {

  private regionsSubject = new Subject<any>();
  private flavorsSubject = new Subject<any>();
  private URL: string = "/api/v2/providers/aws";

  constructor(private http: Http,
              private config: AppConfig) {
  }


  private static getCredentials(cloudProvider: CloudProvider) {
    let credentials = cloudProvider.credential;
    console.log("Credentials", credentials);
    return {
      "AWS_ACCESS_KEY_ID": credentials.access_key_id,
      "AWS_SECRET_ACCESS_KEY": credentials.secret_access_key
    }
  }

  public authenticate(cloudProvider: CloudProvider): Observable<object> {
    let credentials = AwsMetadataService.getCredentials(cloudProvider);
    return this.http.post(this.URL + "/authenticate", credentials)
      .map((res) => {
        this.loadFlavors(credentials);
        return res.json();
      }).catch(res => Observable.throw(res.json()));
  }

  getRegions(): Observable<any[]> {
    return Observable.of([
      {value: 'eu-west-1', displayValue: 'EU (Ireland)'},
      {value: 'eu-central-1', displayValue: 'EU (Frankfurt)'},
      {value: 'us-east-1', displayValue: 'US East (N. Virginia)'},
      {value: 'us-east-2', displayValue: 'US East (Ohio)'},
      {value: 'us-west-1', displayValue: 'US West (N. California)'},
      {value: 'us-west-2', displayValue: 'US West (Oregon)'},
      {value: 'ca-central-1', displayValue: 'Canada (Central)'}
    ]);
  }

  getFlavors(): Observable<any[]> {
    return this.flavorsSubject.asObservable();
  }

  private loadRegions(credentials) {

  }

  private loadFlavors(credentials) {
    this.http.get(this.URL + "/flavors", credentials).subscribe(
      (data) => {
        console.log(data);
        let flavors = data.json()["data"];
        console.log("Flavors", flavors["data"]);
        this.flavorsSubject.next(flavors["data"]);
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
}
