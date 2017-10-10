import { inject, TestBed } from '@angular/core/testing';

import { CloudProviderMetadataService } from './cloud-provider-metadata.service';

describe('CloudProviderMetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CloudProviderMetadataService]
    });
  });

  it('should ...', inject([CloudProviderMetadataService], (service: CloudProviderMetadataService) => {
    expect(service).toBeTruthy();
  }));
});
