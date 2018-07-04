import { inject, TestBed } from '@angular/core/testing';

import { OpenStackMetadataService } from './open-stack-metadata.service';

describe('CloudProviderMetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenStackMetadataService]
    });
  });

  it('should ...', inject([OpenStackMetadataService], (service: OpenStackMetadataService) => {
    expect(service).toBeTruthy();
  }));
});
