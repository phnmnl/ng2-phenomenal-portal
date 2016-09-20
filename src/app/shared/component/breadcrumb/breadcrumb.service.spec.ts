/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { BreadcrumbService } from './breadcrumb.service';

describe('Service: Breadcrumb', () => {
  beforeEach(() => {
    addProviders([BreadcrumbService]);
  });

  it('should ...',
    inject([BreadcrumbService],
      (service: BreadcrumbService) => {
        expect(service).toBeTruthy();
      }));
});
