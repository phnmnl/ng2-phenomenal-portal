import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig } from '../../../app.config';
import { Observable } from 'rxjs/Observable';
import { AppLibraryCategories } from "./categories";

/**
 * Fetch application information from PHP-based backend
 */
@Injectable()
export class ApplicationLibraryService {

  private readonly baseUrl = window.location.protocol + '//';
  private metadataUrl = '/php-phenomenal-portal-app-library';
  private headUrl: string;
  private categories: AppLibraryCategories;

  constructor(private http: Http,
              private config: AppConfig) {
    this.baseUrl += config.getConfig('host') ? config.getConfig('host') : window.location.hostname;
    this.baseUrl += ':' + (config.getConfig('port') ? config.getConfig('port') : window.location.port);
    this.headUrl = this.baseUrl + this.metadataUrl;
  }

  /**
   * load all applications
   * @returns {Observable<string[]>}
   */
  loadAllApp(): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php')
      .map(this.extractData);
  }

  /**
   * load a specific application by name
   * @param {string} name
   * @returns {Observable<string[]>}
   */
  loadApp(name: string): Observable<string[]> {
    return this.http.get(this.headUrl + '/api/apps.php?app=' + name)
      .map(this.extractData);
  }

  /**
   * load a subset of applications by the technology used
   * @param {string} technologies
   * @returns {Observable<{}>}
   */
  loadSomeApp(technologies: string) {

    return this.http.get(this.headUrl + '/api/apps.php?' + technologies)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

  public getCategories(): AppLibraryCategories {
    if (!this.categories)
      this.initCategories();
    return this.categories;
  }


  public initCategories() {

    let functionality = [
      {id: '1', name: 'Preprocessing', parent: '#', children: [], isCheck: false},
      {
        id: '2', name: 'Annotation', parent: '#', children: [
          {
            id: '7', name: 'MS', parent: '2', children: [
              {id: '9', name: 'L4 Unequivocal Molecular Formula', parent: '7', children: [], isCheck: false},
              {id: '10', name: 'L3 Tentative Candidates', parent: '7', children: [], isCheck: false},
              {id: '11', name: 'L2a Library Spectrum Match', parent: '7', children: [], isCheck: false}
            ], isCheck: false
          },
          {id: '8', name: 'NMR', parent: '2', children: [], isCheck: false}
        ], isCheck: false
      },
      {id: '3', name: 'Post-processing', parent: '#', children: [], isCheck: false},
      {id: '4', name: 'Statistical Analysis', parent: '#', children: [], isCheck: false},
      {id: '5', name: 'Workflows', parent: '#', children: [], isCheck: false},
      {id: '6', name: 'Other Tools', parent: '#', children: [], isCheck: false}
    ];

    let approaches = [
      {
        id: 'a1', name: 'Metabolomics', parent: '#', children: [
          {id: 'a9', name: 'Targeted', parent: 'a1', children: [], isCheck: false},
          {id: 'a10', name: 'Untargeted', parent: 'a1', children: [], isCheck: false},
        ], isCheck: false
      },
      {
        id: 'a2', name: 'Isotopic Labelling Analysis', parent: '#', children: [
          {id: 'a7', name: '¹³C', parent: 'a2', children: [], isCheck: false},
          {id: 'a8', name: 'All Isotopes', parent: 'a2', children: [], isCheck: false}
        ], isCheck: false
      },
      {
        id: 'a3', name: 'Lipidomics', parent: '#', children: [
          {id: 'a6', name: 'Lipidomics MS', parent: 'a3', children: [], isCheck: false}
        ], isCheck: false
      },
      {id: 'a4', name: 'Glycomics', parent: '#', children: [], isCheck: false}
    ];

    let instrument = [
      {
        id: 'b1', name: 'MS', parent: '#', children: [
          {
            id: 'b9', name: 'LC-MS', parent: 'b1', children: [
              {id: 'b30', name: 'Orbitrap LC-MS', parent: 'b9', children: [], isCheck: false},
              {
                id: 'b31', name: 'LC-MS/MS', parent: 'b9', children: [
                  {id: 'b37', name: 'LC-MSⁿ', parent: 'b31', children: [], isCheck: false}
                ], isCheck: false
              },
              {id: 'b32', name: 'CE-FT-MS', parent: 'b9', children: [], isCheck: false},
              {id: 'b33', name: 'HPLC-MS', parent: 'b9', children: [], isCheck: false},
              {id: 'b34', name: 'UPLC-MS', parent: 'b9', children: [], isCheck: false},
              {id: 'b35', name: 'Centroid LC-MS', parent: 'b9', children: [], isCheck: false},
              {id: 'b36', name: 'LC-MS SRM', parent: 'b9', children: [], isCheck: false}
            ], isCheck: false
          },
          {
            id: 'b10', name: 'GC-MS', parent: 'b1', children: [
              {id: 'b42', name: 'GC-TOF-MS', parent: 'b10', children: [], isCheck: false},
              {id: 'b43', name: '2D GC-MS', parent: 'b10', children: [], isCheck: false},
              {id: 'b44', name: 'GC-MS/MS', parent: 'b10', children: [], isCheck: false},
              {id: 'b45', name: 'GC-MS SRM', parent: 'b10', children: [], isCheck: false},
              {id: 'b46', name: 'GC-MS SIM', parent: 'b10', children: [], isCheck: false}
            ], isCheck: false
          },
          {
            id: 'b11', name: 'DI-MS', parent: 'b1', children: [
              {id: 'b55', name: 'DI-MS/MS', parent: 'b11', children: [], isCheck: false},
              {id: 'b56', name: 'DI-FT-ICR-MS', parent: 'b11', children: [], isCheck: false}
            ], isCheck: false
          },
          {
            id: 'b12', name: 'CE-MS', parent: 'b1', children: [
              {id: 'b56', name: 'CE-MS/MS', parent: 'b12', children: [], isCheck: false}
            ], isCheck: false
          }
        ], isCheck: false
      },
      {
        id: 'b2', name: 'NMR', parent: '#', children: [
          {id: 'b67', name: '1D NMR', parent: 'b2', children: [], isCheck: false},
          {
            id: 'b68', name: '2D NMR', parent: 'b2', children: [
              {id: 'b75', name: '2D TOCSY', parent: 'b68', children: [], isCheck: false},
              {
                id: 'b76', name: '2D HSQC', parent: 'b68', children: [
                  {id: 'b77', name: '2D ¹H ¹³C-HSQC NMR', parent: 'b76', children: [], isCheck: false}
                ], isCheck: false
              }
            ], isCheck: false
          },
          {id: 'b69', name: '¹H NMR', parent: 'b2', children: [], isCheck: false},
          {id: 'b66', name: 'Covariance NMR', parent: 'b2', children: [], isCheck: false}
        ], isCheck: false
      },
      {id: 'b3', name: 'IR', parent: '#', children: [], isCheck: false},
      {id: 'b4', name: 'Raman', parent: '#', children: [], isCheck: false},
      {id: 'b5', name: 'UV/VIS', parent: '#', children: [], isCheck: false},
      {
        id: 'b6', name: 'DAD', parent: '#', children: [
          {id: 'b89', name: 'HPLC-DAD', parent: 'b6', children: [], isCheck: false},
          {id: 'b86', name: 'LC-UV-DAD', parent: 'b6', children: [], isCheck: false}
        ], isCheck: false
      }
    ];

    this.categories = new AppLibraryCategories(functionality, approaches, instrument);
  }
}
