import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Application } from '../../model/application/application';

declare var xml2json: any;

/**
 * Fetch application information from APPDB
 */
@Injectable()
export class ApplicationsDatabaseService {

  private _applications$: Subject<Application[]>;
  private baseUrl: string;
  private dataStore: {
    applications: Application[]
  };

  constructor(private http: Http) {
    this.baseUrl = 'https://appdb-pi.egi.eu/rest/1.0/applications';
    this.dataStore = {applications: []};
    this._applications$ = <Subject<Application[]>>new Subject();
  }

  get applications$() {
    return this._applications$.asObservable();
  }

  /**
   * load all application data from APPDB
   * @param callback
   */
  loadAll(callback) {
    this.http
      .get(this.baseUrl + '?flt=phenomenal')
      .map(response => JSON.parse(xml2json(response.text(), '  ')))
      .subscribe(data => {
        console.log('[Appdb] Appdb data is %O', data);
        data = this.tailorJSON(data);
        this.dataStore.applications = this.json2Object(data);
        this._applications$.next(this.dataStore.applications);
        return callback();
      }, error => console.log('Could not load applications from AppDB.'));
  }

  /**
   * load application by application id
   * @param id
   * @param callback
   */
  load(id, callback) {
    this.http
      .get(this.baseUrl + '/' + id)
      .map(response => JSON.parse(xml2json(response.text(), '  ')))
      .subscribe(data => {
        console.log('[Appdb] Appdb data is %O', data);
        data = this.tailorJSON(data);
        this.dataStore.applications = this.json2Object(data);
        this._applications$.next(this.dataStore.applications);
        return callback();
      }, error => console.log('Could not load application %O from AppDB.', id));
  }

  private tailorJSON(_data) {
    return _data['appdb:appdb']['application:application'];
  }

  private json2Object(_data) {
    const _applications: Application[] = [];

    if (_data != null) {
      // mapping json to model
      if (_data instanceof Array) {
        // more than 1 object
        for (const _item of _data) {
          _applications.push(new Application(_item));
        }
      } else { // only 1 object
        _applications.push(new Application(_data));
      }
    }
    return _applications;
  }

}
