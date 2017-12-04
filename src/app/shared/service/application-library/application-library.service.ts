import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig } from '../../../app.config';
import { Observable } from 'rxjs/Observable';

/**
 * Fetch application information from PHP-based backend
 */
@Injectable()
export class ApplicationLibraryService {

  private baseUrl = window.location.protocol + '//';
  private metadataUrl = '/php-phenomenal-portal-app-library';
  private headUrl: string;

  constructor(private http: Http,
              private config: AppConfig) {
    this.baseUrl += config.getConfig('host') ? config.getConfig('host') : window.location.hostname;
    this.baseUrl += ':' + (config.getConfig('port') ? config.getConfig('port') : window.location.port);
    this.headUrl = this.baseUrl + this.metadataUrl;
  }

  /**
   * load all applications
   * @returns {Observable<string[]>}
   */
  loadAllApp(): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php')
      .map(this.extractData);
  }

  /**
   * load a specific application by name
   * @param {string} name
   * @returns {Observable<string[]>}
   */
  loadApp(name: string): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php?app=' + name)
      .map(this.extractData);
  }

  /**
   * load a subset of applications by the technology used
   * @param {string} technologies
   * @returns {Observable<{}>}
   */
  loadSomeApp(technologies: string) {

    return this.http.get(this.headUrl + '/api/apps.php?' + technologies)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
