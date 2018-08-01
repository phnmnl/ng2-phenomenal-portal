import { Deployment } from "./deployment";
import { PipelineStepResult } from "./pipeline-step-result";

export class PipelineStep {

  private readonly _id: string;
  private readonly _description: string;
  private readonly _estimatedTime: number;
  private readonly step;
  private _start: number;
  private _end: number;
  private _error: any;
  private _skip: boolean = false;

  constructor(id: string, step, description?: string, estimatedTime?: number) {
    this._id = id;
    this._description = description || this._id;
    this._estimatedTime = estimatedTime;
    this.step = step;
  }

  get id(): string {
    return this._id;
  }

  get description(): string {
    return this._description;
  }

  get estimatedTime(): number {
    return this._estimatedTime;
  }

  get start(): number {
    return this._start;
  }

  get end(): number {
    return this._end;
  }

  get error(): any {
    return this._error;
  }

  public isRunning(): boolean {
    return this._start !== undefined && !this.isTerminated();
  }

  public isTerminated(): boolean {
    return this._end !== undefined;
  }

  public isErrored(): boolean {
    return this._error !== undefined;
  }

  get skip(): boolean {
    return this._skip;
  }

  set skip(value: boolean) {
    this._skip = value;
    if (this._skip)
      this.setTerminated();
  }

  protected setStarted() {
    this._start = Date.now();
    console.log("Started " + this._description + " @ " + this._start);
  }

  protected setTerminated(result?, callback?) {
    this._end = Date.now();
    if (!this._start)
      this._start = this._end;
    console.log("Terminated " + this._description + " @ " + this._end);
    if (callback)
      callback(result);
  }

  public exec(deployment: Deployment, callback) {
    if (!this.step)
      throw new TypeError();
    if (this.isTerminated())
      console.warn("Step already executed!!!", this);
    else {
      this.setStarted();
      this.step(deployment, (result: PipelineStepResult) => {
        this.setTerminated(result, callback);
      });
    }
  }
}
