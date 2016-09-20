/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { WikiService } from './wiki.service';

describe('Service: Wiki', () => {
  beforeEach(() => {
    addProviders([WikiService]);
  });

  it('should ...',
    inject([WikiService],
      (service: WikiService) => {
        expect(service).toBeTruthy();
      }));
});
