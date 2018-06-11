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

  protected setStarted() {
    this._start = Date.now();
    console.log("Started " + this._description + " @ " + this._start);
  }

  protected setTerminated(result?, callback?) {
    this._end = Date.now();
    console.log("Terminated " + this._description + " @ " + this._end);
    if (callback)
      callback(result);
  }

  public exec(deployment: Deployment, callback) {
    if (!this.step)
      throw new TypeError();
    this.setStarted();
    this.step(deployment, (result: PipelineStepResult) => {
      this.setTerminated(result, callback);
    });
  }
}
