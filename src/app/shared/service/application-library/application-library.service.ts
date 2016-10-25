import { Injectable } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class ApplicationLibraryService {

  private baseUrl: string;

  constructor(private http: Http) {
    this.baseUrl  = 'http://phenomenal-h2020.eu/wiki/wiki';
    // this.baseUrl  = 'http://localhost';
  }

  loadAllApp(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/app-library-backend/api/apps.php')
      .map(this.extractData);
  }

  loadApp(name: string): Observable<string[]> {
    return this.http.get(this.baseUrl + '/app-library-backend/api/apps.php?app=' + name)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

  loadSomeApp(technologies: string) {

    return this.http.get(this.baseUrl + '/app-library-backend/api/apps.php?' +  technologies)
      .map(this.extractData);
  }
}
