import { Injectable } from '@angular/core';
import { GalaxyUser } from './galaxy-user';
import { Headers, Http, Response } from '@angular/http';
import { AppConfig } from '../../../app.config';

/**
 * Calling galaxy API
 */
@Injectable()
export class GalaxyService {

  private _galaxy_instance_url = '';
  // private _galaxy_api_key = '';

  constructor(public http: Http,
              private config: AppConfig
  ) {
    // this._galaxy_api_key = config.getConfig('galaxy_api_key');
    // this.galaxy_instance_url = '/api/v1/metadata/createGalaxyUser';
    this._galaxy_instance_url = config.getConfig('galaxy_url');
  }

  /**
   * Create a galaxy user
   * @param {GalaxyUser} user
   * @param {string} url
   * @param {string} key
   * @returns {Observable<any>}
   */
  createUser(user: GalaxyUser) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const body = JSON.stringify(user);
    return this.http.post('/api/v1/metadata/createGalaxyUser', body, headers).map((res: Response) => res.json());
  }
  // createUser(user: GalaxyUser, url: string, key: string) {
  //   const headers = new Headers({'Content-Type': 'application/json'});
  //   const body = JSON.stringify(user);
  //   return this.http.post(url + '/api/users' + '?key=' + key, body, headers).map((res: Response) => res.json());
  // }

  get galaxy_instance_url(): string {
    return this._galaxy_instance_url;
  }
  //
  // get galaxy_api_key(): string {
  //   return this._galaxy_api_key;
  // }
}
