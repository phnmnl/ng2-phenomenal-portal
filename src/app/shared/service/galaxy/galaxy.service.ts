import { Injectable } from '@angular/core';
import {GalaxyUser} from './galaxy-user';
import {Http, Response, Headers} from '@angular/http';

@Injectable()
export class GalaxyService {

  private _galaxy_instance_url = 'http://193.62.54.91:30700';
  private _galaxy_api_key = 'b5d33930050dad02d448271c5ab7f80e';

  constructor(public http: Http) { }

  createUser(user: GalaxyUser, url: string, key: string) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const body = JSON.stringify(user);
    return this.http.post(url + '/api/users' + '?key=' + key, body, headers).map((res: Response) => res.json());
  }

  get galaxy_instance_url(): string {
    return this._galaxy_instance_url;
  }

  get galaxy_api_key(): string {
    return this._galaxy_api_key;
  }
}
