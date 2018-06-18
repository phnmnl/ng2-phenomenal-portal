import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { Error } from "./Error";

@Injectable()
export class ErrorService {

  private errorSubject: Subject<Error> = new Subject<Error>();

  constructor() {

    setTimeout(() => {
      this.notifyError(401, "Authentication error", {});
    }, 10000);

    setTimeout(() => {
      this.notifyError("401", "Authentication error", {});
    }, 20000);
  }

  public getErrorAsObservable(): Observable<Error> {
    return this.errorSubject.asObservable();
  }

  public notifyError(code: any, message: string, error: object) {
    this.errorSubject.next(new Error(code, message, error));
  }

}
