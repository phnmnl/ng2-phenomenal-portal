import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {User} from './user';
@Injectable()
export class UserService {
  private baseUrl: string;
  private metadataUrl: string;
  private headUrl: string;

  constructor(private http: Http) {
    this.baseUrl = 'http://localhost:8080';
    this.metadataUrl = '/api/v1/metadata';
    this.headUrl = this.baseUrl + this.metadataUrl;
  }

  get(id: string): Observable<string[]>  {
    const url = this.headUrl + '/' + id ;
    return this.http.get(url).map(this.extractData);
  }

  add(id: string): Observable<string[]>  {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options       = new RequestOptions({ headers: headers }); // Create a request option

    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.post(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  updateTermCondition(id: string): Observable<string[]>  {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options       = new RequestOptions({ headers: headers }); // Create a request option

    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.put(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  // add(user: User, jwtToken: string): Observable<string[]>  {
  //   const url = this.headUrl;
  //   const body = user;
  //
  //   const bodyString = JSON.stringify(body); // Stringify payload
  //   const headers      = new Headers({
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + jwtToken
  //   }); // ... Set content type to JSON
  //   const options       = new RequestOptions({ headers: headers }); // Create a request option
  //   return this.http.post(url, bodyString, options).map(this.extractData);
  // }
  //
  // edit(user: User, jwtToken: string): Observable<string[]>  {
  //   const url = this.headUrl;
  //   const body = user;
  //
  //   const bodyString = JSON.stringify(body); // Stringify payload
  //   const headers      = new Headers({
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + jwtToken
  //   }); // ... Set content type to JSON
  //   const options       = new RequestOptions({ headers: headers }); // Create a request option
  //   return this.http.put(url, bodyString, options).map(this.extractData);
  // }
  //
  // get(user: User, jwtToken: string): Observable<string[]>  {
  //   const url = this.headUrl + '/' + user.id ;
  //
  //   const headers      = new Headers({
  //     'Authorization': 'Bearer ' + jwtToken
  //   }); // ... Set content type to JSON
  //   const options  = new RequestOptions({ headers: headers }); // Create a request option
  //   return this.http.get(url, options).map(this.extractData);
  // }
  //
  // authenticate(): Observable<string[]>  {
  //   const url = this.baseUrl + '/api/authenticate';
  //   const body = {username: 'admin', password: 'admin'};
  //
  //   const bodyString = JSON.stringify(body); // Stringify payload
  //   const headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
  //   const options       = new RequestOptions({ headers: headers }); // Create a request option
  //   return this.http.post(url, bodyString, options).map(this.extractData);
  // }

  private extractData(res: Response) {
    const body = res.json();
    return body || {};
  }


}
