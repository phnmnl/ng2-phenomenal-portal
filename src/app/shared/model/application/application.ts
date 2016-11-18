import {Url} from '../../../application-library/application-grid/url/url';

export class Application {

  abstract: string;
  short_description: string;
  id: string;
  lastUpdated: string;
  logo_default: string;
  logo_large: string;
  logo_small: string;
  name: string;
  permalink: string;
  status: string;
  urls: Url[] = [];

  constructor(_item) {
    this.loadParameterAsRequired(_item);
    console.log('Construction Initialisation [Model: AppdbAppliance]' + this.name);
  }

  loadParameterAsRequired(_item) {
    this.abstract = _item['application:abstract'];
    this.short_description = _item['application:description'];
    this.id = _item['@id'];
    this.lastUpdated = _item['application:lastUpdated'];
    this.logo_default = 'https://appdb.egi.eu/images/category34.png';
    this.logo_large = _item['application:logo'] ? _item['application:logo'] + '&size=2' : this.logo_default; // get bigger image
    this.logo_small = _item['application:logo'] ? _item['application:logo'] : this.logo_default;
    this.name = _item['application:name'];
    this.permalink = _item['application:permalink'];
    this.status = _item['application:status']['#text'];

    this.urls = this.json2Object(_item['application:url'], this.urls);
  }

  private json2Object(_data, _url) {

    if (_data != null) {
      // mapping json to model
      if (_data instanceof Array) {
        // more than 1 object
        for (let _item of _data) {
          _url.push(new Url(_item));
        }
      } else { // only 1 object
        _url.push(new Url(_data));
      }
    }
    return _url;
  }
}
