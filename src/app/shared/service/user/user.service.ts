import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {User} from './user';
@Injectable()
export class UserService {
  private baseUrl: string;

  constructor(private http: Http) {
    this.baseUrl = 'http://localhost:8080';
  }

  add(user: User, jwtToken: string): Observable<string[]>  {
    const url = this.baseUrl + '/portal/api/users';
    const body = user;

    const bodyString = JSON.stringify(body); // Stringify payload
    const headers      = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwtToken
    }); // ... Set content type to JSON
    const options       = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.post(url, bodyString, options).map(this.extractData);
  }

  edit(user: User, jwtToken: string): Observable<string[]>  {
    const url = this.baseUrl + '/portal/api/users';
    const body = user;

    const bodyString = JSON.stringify(body); // Stringify payload
    const headers      = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwtToken
    }); // ... Set content type to JSON
    const options       = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.put(url, bodyString, options).map(this.extractData);
  }

  get(user: User, jwtToken: string): Observable<string[]>  {
    const url = this.baseUrl + '/portal/api/users/' + user.id ;

    const headers      = new Headers({
      'Authorization': 'Bearer ' + jwtToken
    }); // ... Set content type to JSON
    const options  = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.get(url, options).map(this.extractData);
  }

  authenticate(): Observable<string[]>  {
    const url = this.baseUrl + '/api/authenticate';
    const body = {username: 'admin', password: 'admin'};

    const bodyString = JSON.stringify(body); // Stringify payload
    const headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    const options       = new RequestOptions({ headers: headers }); // Create a request option
    return this.http.post(url, bodyString, options).map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || {};
  }


}
