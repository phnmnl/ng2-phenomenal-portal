/* tslint:disable:no-unused-variable */

import { async, inject } from '@angular/core/testing';
import { WikiService } from './wiki.service';

describe('Service: Wiki', () => {

  it('should ...',
    inject([WikiService],
      (service: WikiService) => {
        expect(service).toBeTruthy();
      }));
});
