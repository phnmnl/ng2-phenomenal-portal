/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ApplicationLibraryService } from './application-library.service';
import {HttpModule} from "@angular/http";

describe('Service: ApplicationLibrary', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationLibraryService],
      imports: [HttpModule]
    });
  });

  it('should ...', inject([ApplicationLibraryService], (service: ApplicationLibraryService) => {
    expect(service).toBeTruthy();
  }));
});
