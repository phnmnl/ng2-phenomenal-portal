import { Injectable } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class JenkinsReportService {
  private baseUrl: string;

  constructor(private http: Http) {
    this.baseUrl  = 'http://phenomenal-h2020.eu/wiki';
  }

  loadStatus(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/wiki/jenkinsReport.php')
      .map(this.extractData);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.tools || { };
  }
}
