import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

/**
 * get Jenkins report
 */
@Injectable()
export class JenkinsReportService {

  constructor(private http: Http) {
  }

  /**
   * load all application status from Jenkins report
   * @returns {Observable<string[]>}
   */
  loadStatus(): Observable<string[]> {
    return this.http.get('/api/v2/metadata/getJenkinsReport')
      .map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.tools || {};
  }
}
