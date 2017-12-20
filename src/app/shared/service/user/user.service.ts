import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';

/**
 * Control user metadata
 */
@Injectable()
export class UserService {
  private baseUrl = window.location.protocol + '//';
  private metadataUrl = '/api/v1/metadata';
  private headUrl: string;
  private currentUser;

  // 
  private currentUserSource = new Subject<{}>();
  public currentUserObservable = this.currentUserSource.asObservable();

  constructor(private http: Http,
              private authService: AuthService,
              private config: AppConfig) {
    this.baseUrl += config.getConfig('host') ? config.getConfig('host') : window.location.hostname;
    this.baseUrl += ':' + (config.getConfig('port') ? config.getConfig('port') : window.location.port);
    this.headUrl = this.baseUrl + this.metadataUrl;
  public logout() {
    this.authService.credentialService.clearCredentials();
    this.authService.tokenService.clearToken();
    this.setCurrentUser(null);
  }

  public registerTokenListener(renderer: Renderer2) {
    let removeMessageListener = renderer.listen('window', 'message', (event: MessageEvent) => {
      if (!this.authService.canAcceptMessage(event)) {
        console.log('received unacceptable message! Ignoring...', event);
        return;
      } else {
        this.authService.processToken(event.data);
        event.source.close();
        if (this.authService.tokenService.getToken()) {
          this.findById(this.authService.credentialService.getUsername()).subscribe(
            (userInfo) => {
              console.log("User exists", userInfo);
              if (userInfo) { // TODO: explicit check if the user has accepted the terms&conditions
                userInfo["id"] = this.authService.credentialService.getUsername();
                userInfo["username"] = this.authService.credentialService.getUsername();
                userInfo["email"] = this.authService.credentialService.getEmail();
                console.log("Fetched user info: ", userInfo);
                this.setCurrentUser(userInfo);
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      }
    });

    return removeMessageListener;
  }


  private notifyUser() {
    this.currentUserSource.next(this.currentUser);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(userInfo: any) {
    console.log("Call to 'setCurrentUser'");
    this.currentUser = userInfo ? new User(userInfo) : null;
    this.notifyUser();
  }
  /**
   * get user metadata by id
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  get(id: string): Observable<string[]> {
    const url = this.headUrl + '/' + id;
    return this.http.get(url).map(this.extractData);
  }

  /**
   * add user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  add(id: string): Observable<string[]> {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.post(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  /**
   * update a user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  updateTermCondition(id: string): Observable<string[]> {
    const url = this.headUrl;
    const data = {Idmetadata: id, Isaccepttermcondition: 1, Isregistergalaxy: 0};

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('Metadata', JSON.stringify(data));

    return this.http.put(url, urlSearchParams.toString(), options).map(this.extractData);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || {};
  }


}
