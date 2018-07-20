import { TestBed, inject } from '@angular/core/testing';

import { CloudProviderCatalogService } from './cloud-provider-catalog.service';

describe('CloudProviderCatalogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CloudProviderCatalogService]
    });
  });

  it('should be created', inject([CloudProviderCatalogService], (service: CloudProviderCatalogService) => {
    expect(service).toBeTruthy();
  }));
});
