export class Error {

  private readonly _code: any;
  private readonly _message: string;
  private readonly _error: object;


  constructor(code: any, message: string, error: object) {
    this._code = code;
    this._message = message;
    this._error = error;
  }

  get code(): any {
    return this._code;
  }

  get message(): string {
    return this._message;
  }

  get error(): object {
    return this._error;
  }
}
