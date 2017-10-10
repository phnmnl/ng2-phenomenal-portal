/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { PhenomenalTokenService } from './phenomenal-token.service';

describe('PhenomenalTokenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhenomenalTokenService]
    });
  });

  it('should ...', inject([PhenomenalTokenService], (service: PhenomenalTokenService) => {
    expect(service).toBeTruthy();
  }));
});
