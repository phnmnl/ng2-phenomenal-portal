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
        for (let providerConfig of data) {
          //console.log("[DEBUG] === Metadata server returned this: %O", providerConfig);
          /*
           * The preconfigured provider configuration comes directly from the metadata server.
           * We expect the following structure:
           *  {
           *    "name": "...",
           *    "title": "...",
           *    "description": "",
           *    "providerDescription": "...",
           *    "locationDescription": "...",
           *    "paymentDescription": "...",
           *    "logo": {
           *      "path": "some_file.png",
           *      "width": "1234px",
           *      "height": "1234px"
           *    },
           *    "credential": {
           *       "rc_file": "RC file data"
           *    }
           * }
           */
          // recycle the same structure, with the addition of some attributes
          providerConfig["preset"] = providerConfig["id"];
          providerConfig["name"] = "ostack";
          providerConfig["preconfigured"] = true;
          providerConfig['rc_file'] = providerConfig['credential']['rc_file'];

          providers.push(new CloudProvider(providerConfig));
        }
        return providers;
      }).catch(res => Observable.throw(res.json()));
  }

}
