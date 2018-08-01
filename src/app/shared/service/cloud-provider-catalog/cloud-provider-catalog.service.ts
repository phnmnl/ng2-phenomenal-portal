import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { TokenService } from "ng2-cloud-portal-service-lib";
import { AppConfig } from "../../../app.config";
import { Observable } from "rxjs/Observable";
import { CloudProvider } from "../deployer/cloud-provider";
import { ProviderRegistry } from "./provider-registry";

@Injectable()
export class CloudProviderCatalogService {

  private URL: string = "/api/v2/providers/catalog";

  constructor(private http: Http,
              private tokenService: TokenService,
              private config: AppConfig) {
  }

  public getPhenomenalProvider() {
    return ProviderRegistry.getPhenomenalProvider();
  }

  public getProviders() {
    return ProviderRegistry.getProviders();
  }

  public getPreconfiguredProviders() {
    return this.http.get(this.URL)
      .map((res) => {
        let providers = [];
        let data = res.json()['data'];
        for (let p of data) {
          p["preset"] = p["id"];
          p["name"] = "ostack";
          p["preconfigured"] = true;
          providers.push(new CloudProvider(p));
        }
        return providers;
      }).catch(res => Observable.throw(res.json()));
  }

}
