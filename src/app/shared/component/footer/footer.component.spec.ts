/* tslint:disable:no-unused-variable */

import { FooterComponent } from './footer.component';
import { AppConfig } from "../../../app.config";
import { inject } from "@angular/core/testing";

describe('Component: Footer', () => {
  let appConfig: AppConfig;
  beforeEach(inject([AppConfig], (config: AppConfig) => {
    appConfig = config;
  }));
  
  it('should create an instance', () => {
    const component = new FooterComponent(appConfig);
    expect(component).toBeTruthy();
  });
});
