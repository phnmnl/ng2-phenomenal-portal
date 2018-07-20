import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { TokenService } from "ng2-cloud-portal-service-lib";
import { AppConfig } from "../../../app.config";
import { Observable } from "rxjs/Observable";
import { CloudProvider } from "../deployer/cloud-provider";

@Injectable()
export class CloudProviderCatalogService {

  private URL: string = "/api/v2/providers/catalog";

  constructor(private http: Http,
              private tokenService: TokenService,
              private config: AppConfig) {
  }

  public getProviders() {
    return this.http.get(this.URL)
      .map((res) => {
        let providers = [];
        let data = res.json()['data'];
        for(let p of data){
          p["preset"] = p["id"];
          p["name"] = "ostack";
          p["preconfigured"] = true;
          providers.push(new CloudProvider(p));
        }
        return providers;
      }).catch(res => Observable.throw(res.json()));
  }

  public getProvider(providerName: string) {
    return this.http.get(this.URL + "/" + providerName)
      .map((res) => {
        return res.json()['data'];
      }).catch(res => Observable.throw(res.json()));
  }

  public getProviderCredentials(providerName: string) {
    return this.http.get(this.URL + "/" + providerName + "/credentials")
      .map((res) => {
        return res.json()['data'];
      }).catch(res => Observable.throw(res.json()));
  }

}
