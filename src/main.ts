import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ApplicationRef, enableProdMode, VERSION } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';
import { enableDebugTools } from "@angular/platform-browser";

if (environment.production) {
  enableProdMode();
  console.log("Enabling Production mode");
}

platformBrowserDynamic().bootstrapModule(AppModule).then((module) => {
  if (!environment.production) {
    console.log("Enabling Development tools...");
    console.log(VERSION.full);
    let applicationRef = module.injector.get(ApplicationRef);
    let appComponent = applicationRef.components[0];
    enableDebugTools(appComponent);
  }
});
