/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { GalaxyService } from './galaxy.service';

describe('GalaxyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GalaxyService]
    });
  });

  it('should ...', inject([GalaxyService], (service: GalaxyService) => {
    expect(service).toBeTruthy();
  }));
});
