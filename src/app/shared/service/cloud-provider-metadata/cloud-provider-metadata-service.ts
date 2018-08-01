import { CloudProvider } from "../deployer/cloud-provider";
import { Observable } from "rxjs";

export interface ICloudProviderMetadataService {

  authenticate(cloudProvider: CloudProvider): Observable<object>;

  getRegions(): Observable<any[]>;

  getFlavors(): Observable<any[]>;

}
