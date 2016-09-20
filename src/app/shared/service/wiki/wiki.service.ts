import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';

import { Observable }     from 'rxjs/Observable';

@Injectable()
export class WikiService {
  private baseUrl: string;

  constructor(private http: Http) {
     this.baseUrl  = 'http://phenomenal-h2020.eu/vre-gateway';
    // this.baseUrl  = 'http://localhost/FederatedGitWiki';
  }

  loadMenu(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/wiki/controller.php?filename=phenomenal-h2020.wiki&format=array')
      .map(this.extractData);
  }

  loadUserDocumnetatonMenu(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/wiki/menu.php?foldername=phenomenal-h2020.wiki&filename=User-Documentation&format=array&limit=100')
      .map(this.extractData);
  }

  loadDeveloperDocumentationMenu(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/wiki/menu.php?foldername=phenomenal-h2020.wiki&filename=Developer-Documentation&format=array&limit=100')
      .map(this.extractData);
  }

  loadTutorialsMenu(): Observable<string[]> {
    return this.http.get(this.baseUrl + '/wiki/menu.php?foldername=phenomenal-h2020.wiki&filename=Tutorials&format=array&limit=100')
      .map(this.extractData);
  }

  loadPage(id) {
    return this.http.get(this.baseUrl + '/wiki/page.php?foldername=phenomenal-h2020.wiki&filename=' + id + '&format=array&limit=3')
      .map(this.extractData);
  }

  search(term: string) {
    let url = this.baseUrl + '/wiki/search.php?term='+ term;

    let params = new URLSearchParams();
    params.set('search', term); // the user's search value

    // TODO: Add error handling
    return this.http
      .get(url)
      .map(this.extractData);
  }


  // search(terms: Observable<string>, debounceDuration = 400) {
  //   return terms.debounceTime(debounceDuration)
  //     .distinctUntilChanged()
  //     .switchMap(term => this.rawSearch(term));
  // }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

}
