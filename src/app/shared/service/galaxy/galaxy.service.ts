import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {AppConfig} from '../../../app.config';

/**
 * Calling galaxy API
 */
@Injectable()
export class GalaxyService {

  private _galaxy_instance_url = '';
  private _galaxy_api_key = '';

  constructor(public http: Http,
              private config: AppConfig) {
    this._galaxy_api_key = config.getConfig('galaxy_api_key');
    this._galaxy_instance_url = config.getConfig('galaxy_url');
  }

  get galaxy_instance_url(): string {
    return this._galaxy_instance_url;
  }

  get galaxy_api_key(): string {
    return this._galaxy_api_key;
  }
}
