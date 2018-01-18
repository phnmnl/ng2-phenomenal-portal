import { Injectable, Renderer2 } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';
import { GalaxyUser } from "../galaxy/galaxy-user";
import { AuthService } from "ng2-cloud-portal-service-lib";
import { Subject } from "rxjs/Subject";
import { User } from "./user";

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

  constructor(private http: Http,
              private authService: AuthService,
              private config: AppConfig) {
    this.baseUrl += config.getConfig('host') ? config.getConfig('host') : window.location.hostname;
    this.baseUrl += ':' + (config.getConfig('port') ? config.getConfig('port') : window.location.port);
    this.headUrl = this.baseUrl + this.metadataUrl;

    // Check whether a user is already logged in and loads its data
    console.log("Current username in CredentialService", this.authService.credentialService.getUsername());
    if (this.authService.credentialService.getUsername()) {
      this.findById(this.authService.credentialService.getUsername()).subscribe(
        (userInfo) => {
          console.log("User info from backend service", userInfo);
          if (userInfo) {
            userInfo["id"] = this.authService.credentialService.getUsername();
            userInfo["name"] = this.authService.credentialService.getGivenName();
            userInfo["username"] = this.authService.credentialService.getUsername();
            userInfo["email"] = this.authService.credentialService.getEmail();
            console.log("Fetched user info: ", userInfo);
            this.setCurrentUser(userInfo);
          } else {
            console.log("User with id '" + this.authService.credentialService.getUsername() + "' not found!");
          }
        },
        (err) => {
          this.logout();
          console.error(err);
        }
      );
    }

    console.info("UserService initialized!!!");
  }

  public logout() {
    this.authService.credentialService.clearCredentials();
    this.authService.tokenService.clearToken();
    this.setCurrentUser(null);
  }

  public isUserAuthenticated() {
    console.log(this.authService.credentialService.getUsername(), this.authService.credentialService.getUsername() !== null);
    return this.authService.credentialService.getUsername() !== null;
  }

  public getObservableCurrentUser(): Observable<any> {
    return this.currentUserSource.asObservable();
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
                userInfo["name"] = this.authService.credentialService.getGivenName();
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
    console.log("Call to 'setCurrentUser'", userInfo);
    this.currentUser = userInfo ? new User(userInfo) : null;
    this.notifyUser();
  }


  findById(id: string): Observable<string[]> {
    const url = this.headUrl + '?id=' + id;
    return this.http.get(url).map(this.extractUserData);
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
   * @param user
   * @returns {Observable<string[]>}
   */
  createGalaxyAccount(id: string, user: GalaxyUser): Observable<string[]> {
    const url = this.headUrl + "/createGalaxyUser";
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('token', id);
    urlSearchParams.append('username', user.username);
    urlSearchParams.append('password', user.password);
    urlSearchParams.append('email', user.email);

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

  private extractUserData(res: Response) {
    console.log("Response", res);
    let data = res.json();
    console.log("Response body", data);
    return "data" in data ? data["data"] : false;
  }

  private extractData(res: Response) {
    console.log("Response", res);
    const jresponse = res.json();
    console.log(jresponse);
    return jresponse && jresponse.body && jresponse.body!=="null" ? jresponse : null;
  }

}
