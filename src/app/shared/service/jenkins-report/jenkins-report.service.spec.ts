/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { JenkinsReportService } from './jenkins-report.service';

describe('Service: JenkinsReport', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JenkinsReportService]
    });
  });

  it('should ...', inject([JenkinsReportService], (service: JenkinsReportService) => {
    expect(service).toBeTruthy();
  }));
});
