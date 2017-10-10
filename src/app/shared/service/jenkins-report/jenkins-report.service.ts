import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class JenkinsReportService {
  private baseUrl: string;

  constructor(private http: Http) {
  }

  loadStatus(): Observable<string[]> {
    return this.http.get('/api/v1/metadata/getJenkinsReport')
      .map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.tools || {};
  }
}
