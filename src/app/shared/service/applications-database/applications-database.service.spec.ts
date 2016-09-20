/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { ApplicationsDatabaseService } from './applications-database.service';

describe('Service: ApplicationsDatabase', () => {
  beforeEach(() => {
    addProviders([ApplicationsDatabaseService]);
  });

  it('should ...',
    inject([ApplicationsDatabaseService],
      (service: ApplicationsDatabaseService) => {
        expect(service).toBeTruthy();
      }));
});
