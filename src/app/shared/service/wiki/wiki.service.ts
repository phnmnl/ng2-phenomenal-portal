import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class WikiService {
  private baseUrl: string;
  private gitRepoName = 'phenomenal-h2020.wiki';

  constructor(private http: Http) {
    this.baseUrl = 'http://phenomenal-h2020.eu/wiki';
    // this.baseUrl  = 'http://localhost/FederatedGitWiki';
  }

  loadMenu(): Observable<string[]> {
    const url = this.baseUrl + '/wiki/controller.php?filename=' + this.gitRepoName + '&format=array';
    return this.http.get(url).map(this.extractData);
  }

  loadUserDocumentationMenu(): Observable<string[]> {
    const url = this.baseUrl + '/wiki/menu.php?foldername=' + this.gitRepoName + '&filename=User-Documentation&format=array&limit=100';
    return this.http.get(url).map(this.extractData);
  }

  loadDeveloperDocumentationMenu(): Observable<string[]> {
    const url = this.baseUrl + '/wiki/menu.php?foldername=' + this.gitRepoName + '&filename=Developer-Documentation&format=array&limit=100';
    return this.http.get(url).map(this.extractData);
  }

  loadTutorialsMenu(): Observable<string[]> {
    const url = this.baseUrl + '/wiki/menu.php?foldername=' + this.gitRepoName + '&filename=Tutorials&format=array&limit=100';
    return this.http.get(url).map(this.extractData);
  }

  loadPage(id) {
    const url = this.baseUrl + '/wiki/page.php?foldername=' + this.gitRepoName + '&filename=' + id + '&format=array&limit=3';
    return this.http.get(url).map(this.extractData);
  }

  search(term: string) {
    const url = this.baseUrl + '/wiki/search.php?term=' + term;

    const params = new URLSearchParams();
    params.set('search', term); // the user's search value

    // TODO: Add error handling
    return this.http
      .get(url)
      .map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

}
