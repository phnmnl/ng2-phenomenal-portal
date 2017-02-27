import { Injectable } from '@angular/core';
import {GalaxyUser} from './galaxy-user';
import {Http, Response, Headers} from '@angular/http';

@Injectable()
export class GalaxyService {

  constructor(public http: Http) { }

  createUser(user: GalaxyUser, url: string, key: string) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const body = JSON.stringify(user);
    return this.http.post(url + '/api/users' + '?key=' + key, body, headers).map((res: Response) => res.json());
  }

}
