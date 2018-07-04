import { CloudProvider } from "../../../setup/cloud-provider";
import { Observable } from "rxjs";

export interface ICloudProviderMetadataService {

  authenticate(cloudProvider: CloudProvider): Observable<object>;

  getRegions(): Observable<any[]>;

  getFlavors(): Observable<any[]>;

}
