import { Injectable, Renderer2 } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../../../app.config';
import { GalaxyUser } from "../galaxy/galaxy-user";
import { ApplicationService, AuthService } from "ng2-cloud-portal-service-lib";
import { Subject } from "rxjs/Subject";
import { User } from "./user";
import { ErrorService } from "../error/error.service";

/**
 * Control user metadata
 */
@Injectable()
export class UserService {

  private readonly baseUrl = window.location.protocol + '//';
  private readonly servicePrefixUrl = '/api/v2';
  private readonly usersServicePath = "users";
  private readonly serviceUrl: string;
  private currentUser;

  //
  private currentUserSource = new Subject<{}>();

  constructor(private http: Http,
              private authService: AuthService,
              private config: AppConfig,
              private errorService: ErrorService,
              private applicationService: ApplicationService) {
    this.baseUrl += config.getConfig('host') ? config.getConfig('host') : window.location.hostname;
    this.baseUrl += ':' + (config.getConfig('port') ? config.getConfig('port') : window.location.port);
    this.serviceUrl = this.baseUrl + this.servicePrefixUrl;
    // load info of the current user
    this.loadCurrentUser();
    console.info("UserService initialized!!!");
  }

  public logout() {
    this.authService.credentialService.clearCredentials();
    this.authService.tokenService.clearToken();
    this.setCurrentUser(null);
  }


  private loadCurrentUser(callback?) {
    // Check whether a user is already logged in and loads its data
    let username = this.authService.credentialService.getUsername();
    console.log("Current username in CredentialService", username);
    if (username) {
      this.findById(username).subscribe(
        (userInfo) => {
          console.log("User info from backend service", userInfo);
          if (userInfo) {
            this.updateCurrentUser(userInfo);
            if (callback)
              callback(userInfo);
          } else {
            console.log("User with id '" + this.authService.credentialService.getUsername() + "' not found!");
            this.registerUser(username).subscribe((userInfo) => {
              console.log("User registered on backend metadata!!!", userInfo);
            });
          }
        },
        (err) => {
          this.logout();
          console.log("Logout after user auth error!!!");
          console.error(err);
        }
      );
    }
  }

  public isUserInSession() {
    let result = this.authService.credentialService.getUsername() !== null
      && this.authService.tokenService.getToken() !== null
      && this.authService.tokenService.getToken().token !== 'null';
    return result;
  }

  public isUserAuthorized(): Observable<User> {
    let hasUserCredentials = this.authService.credentialService.getUsername() !== null
      && this.authService.tokenService.getToken() !== null
      && this.authService.tokenService.getToken().token !== 'null';
    console.log("Has the user valid credentials in the current session?", hasUserCredentials);
    if (!hasUserCredentials) return Observable.throw(this.getCurrentUser());
    return this.findById(this.authService.credentialService.getUsername())
      .map(
        (userInfo) => {
          this.updateCurrentUser(userInfo, false);
          return this.getCurrentUser();
        })
      .switchMap(() => {
        return this.applicationService.getAll(
          this.authService.credentialService.getUsername(), this.authService.tokenService.getToken())
          .map((apps) => {
            console.log("Found apps", apps);
            console.log("User authenticated");
            return this.getCurrentUser();
          })
          .catch((error) => {
            console.error("Error when trying to get apps", error);
            this.errorService.notifyError(error.status, error.message, error);
            return Observable.throw(this.getCurrentUser());
          });
      })
      .map((userInfo) => {
        return userInfo;
      })
      .catch((error) => {
        console.error("Error when trying to load user info", error);
        this.errorService.notifyError(error.status, error.message, error);
        return Observable.throw(this.getCurrentUser());
      });
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
          let username = this.authService.credentialService.getUsername();
          this.findById(username).subscribe(
            (registeredUser) => {
              console.log("User exists", registeredUser);
              if (registeredUser) {
                console.log("User is already registered", registeredUser);
                this.updateLastAccess(username).subscribe((userInfo) => {
                  console.log("Updated last access timestamp", userInfo);
                  this.updateCurrentUser(userInfo);
                });
              } else {
                this.registerUser(this.authService.credentialService.getUsername()).subscribe((userInfo) => {
                  console.log("New user registered", userInfo);
                  this.updateCurrentUser(userInfo);
                });
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


  private updateCurrentUser(userInfo: any, notify: boolean = true) {
    if (userInfo) { // TODO: explicit check if the user has accepted the terms&conditions
      userInfo["id"] = this.authService.credentialService.getUsername();
      userInfo["name"] = this.authService.credentialService.getGivenName();
      userInfo["username"] = this.authService.credentialService.getUsername();
      userInfo["email"] = this.authService.credentialService.getEmail();
      console.log("Fetched user info: ", userInfo);
      this.setCurrentUser(userInfo, notify);
    }
  }

  private notifyUser() {
    this.currentUserSource.next(this.currentUser);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(userInfo: any, notify: boolean = true) {
    console.log("Call to 'setCurrentUser'", userInfo);
    this.currentUser = userInfo ? new User(userInfo) : null;
    if (notify)
      this.notifyUser();
  }


  findById(id: string): Observable<string[]> {
    const url = this.buildUrl(this.usersServicePath, id);
    return this.http.get(url).map(UserService.extractUserData);
  }


  /**
   * get user metadata by id
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  get(id: string): Observable<string[]> {
    const url = this.buildUrl(this.usersServicePath, id);
    return this.http.get(url).map(UserService.extractUserData);
  }

  /**
   * add user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  registerUser(id: string): Observable<string[]> {
    const url = this.buildUrl(this.usersServicePath);

    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('id', id);
    urlSearchParams.append('firstAccess', (Date.now() / 1000).toString());

    return this.http.post(url, urlSearchParams.toString(), options).map(UserService.extractUserData);
  }

  /**
   * update a user metadata
   * @param {string} id
   * @param user
   * @returns {Observable<string[]>}
   */
  createGalaxyAccount(id: string, user: GalaxyUser): Observable<string[]> {
    const url = this.servicePrefixUrl + '/galaxy/users/' + id;
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const options = new RequestOptions({headers: headers}); // Create a request option

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('token', id);
    urlSearchParams.append('username', user.username);
    urlSearchParams.append('password', user.password);
    urlSearchParams.append('email', user.email);

    return this.http.post(url, urlSearchParams.toString(), options).map(UserService.extractUserData);
  }

  updateLastAccess(id: string): Observable<string[]> {
    const url = this.buildUrl(this.usersServicePath, id);
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    // Create headers
    const options = new RequestOptions({headers: headers});
    // Prepare data
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('lastAccess', (Date.now() / 1000).toString());
    // execute the update
    return this.http.put(url, urlSearchParams.toString(), options).map(UserService.extractUserData);
  }


  /**
   * update a user metadata
   * @param {string} id
   * @returns {Observable<string[]>}
   */
  acceptTermsAndConditions(id: string): Observable<string[]> {
    const url = this.buildUrl(this.usersServicePath, id);
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    // Create headers
    const options = new RequestOptions({headers: headers});
    // Prepare data
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("hasAcceptedTermsConditions", "true");
    // execute the update
    return this.http.put(url, urlSearchParams.toString(), options).map(UserService.extractUserData);
  }

  private buildUrl(...paths) {
    let result = this.serviceUrl;
    for (let p of paths)
      result += "/" + p;
    return result;
  }

  private static extractUserData(res: Response) {
    console.log("Response", res);
    let data = res.json();
    console.log("Response body", data);
    data = data && typeof data === "object" && "data" in data ? data["data"] : false;
    if (!data) return false;
    let result = {};
    for (let p in data) {
      result[UserService.lcFirst(p)] = data[p];
    }
    console.log("Extracted data", data, result);
    return result;
  }

  private static lcFirst(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
