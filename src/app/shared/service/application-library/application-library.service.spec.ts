/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ApplicationLibraryService } from './application-library.service';

describe('Service: ApplicationLibrary', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationLibraryService]
    });
  });

  it('should ...', inject([ApplicationLibraryService], (service: ApplicationLibraryService) => {
    expect(service).toBeTruthy();
  }));
});
