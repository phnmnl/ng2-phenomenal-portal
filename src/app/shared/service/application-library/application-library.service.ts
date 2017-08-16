import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { AppConfig } from '../../../app.config';

@Injectable()
export class ApplicationLibraryService {

  private baseUrl = '';
  private metadataUrl: string;
  private headUrl: string;

  constructor(
    private http: Http,
    private config: AppConfig
  ) {
     // this.baseUrl = 'http://phenomenal-h2020.eu/wiki/wiki';
    // this.baseUrl  = 'http://localhost';
    this.metadataUrl = '/php-phenomenal-portal-app-library';
    if (config.getConfig('host') !== '') {
      this.baseUrl = config.getConfig('host') + ':80';
      this.headUrl = this.baseUrl + this.metadataUrl;
    } else {
      this.headUrl = this.metadataUrl;
    }
  }

  loadAllApp(): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php')
      .map(this.extractData);
  }

  loadApp(name: string): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php?app=' + name)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  loadSomeApp(technologies: string) {

    return this.http.get(this.headUrl + '/api/apps.php?' + technologies)
      .map(this.extractData);
  }
}
