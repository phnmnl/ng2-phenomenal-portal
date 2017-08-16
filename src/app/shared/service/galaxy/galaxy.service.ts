import { Injectable } from '@angular/core';
import {GalaxyUser} from './galaxy-user';
import {Http, Response, Headers} from '@angular/http';
import { AppConfig } from '../../../app.config';

@Injectable()
export class GalaxyService {

  private _galaxy_instance_url = '';
  private _galaxy_api_key = '';

  constructor(
    public http: Http,
    private config: AppConfig
  ) {
    this._galaxy_api_key = config.getConfig('galaxy_api_key');
    this._galaxy_instance_url = config.getConfig('galaxy_url');
  }

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
