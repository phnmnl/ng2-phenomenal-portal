import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';

/**
 * Control user metadata
 */
@Injectable()
export class UserService {
  private baseUrl = '';
  private metadataUrl: string;
  private headUrl: string;

  constructor(private http: Http,
              private config: AppConfig) {
    this.metadataUrl = '/api/v1/metadata';
    if (config.getConfig('host') !== '') {
      this.baseUrl = config.getConfig('host') + ':8888';
      this.headUrl = this.baseUrl + this.metadataUrl;
    } else {
      this.headUrl = this.metadataUrl;
    }
  }

  /**
   * get user metadata by id
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  get(id: string): Observable<string[]> {
    const url = this.headUrl + '/' + id;
    return this.http.get(url).map(this.extractData);
  }

  /**
   * add user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  add(id: string): Observable<string[]> {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.post(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  /**
   * update a user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  updateTermCondition(id: string): Observable<string[]> {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.put(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || {};
  }


}
