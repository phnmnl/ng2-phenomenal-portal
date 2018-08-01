import { PipelineStep } from "./pipeline-step";
import { Deployment } from "./deployment";
import { Pipeline } from "./pipeline";
import { Subscription } from "rxjs";

export class LogSearchPipelineStep extends PipelineStep {

  private readonly deployment: Deployment;
  private readonly pipeline: Pipeline;
  private _terminationLabel: string;

  constructor(id: string, description: string, estimatedTime: number,
              deployment: Deployment, pipeline: Pipeline, terminationLabel?: string) {
    super(id, (deployment, callback) => {
      let subscription: Subscription =
        ((this.deployment.isStarting() || this.deployment.isRunning() || this.deployment.isStartedFailed())
          ? this.deployment.getDeployLogsAsObservable() : this.deployment.getDestroyLogsAsObservable())
          .subscribe((logs) => {
            if (!this.isTerminated(false))
              this.checkIfTerminated(logs);
          });
      this.checkLogStep(() => {
        subscription.unsubscribe();
        if (callback)
          callback();
      });
    }, description, estimatedTime);
    this.pipeline = pipeline;
    this.deployment = deployment;
    this._terminationLabel = terminationLabel;
  }

  private getPattern() {
    return this.buildPattern(this.pipeline);
  }


  get terminationLabel(): string {
    return this._terminationLabel;
  }

  set terminationLabel(value: string) {
    this._terminationLabel = value;
  }


  isTerminated(check: boolean = true): boolean {
    if (check && !super.isTerminated())
      this.checkIfTerminated(
        (this.deployment.isStarting() || this.deployment.isRunning() || this.deployment.isStartedFailed())
          ? this.deployment.deployLogs : this.deployment.destroyLogs);
    return super.isTerminated();
  }

  checkIfTerminated(logs: string): boolean {
    let result: boolean = false;
    let pattern: RegExp = this.getPattern();
    if (logs) {
      let matches = logs.match(pattern);
      if (matches && matches.length > 0)
        result = true;
    }
    // console.log("Terminated ", result, pattern);
    if (result)
      this.setTerminated();
    return result;
  }

  private buildPattern(pipeline: Pipeline): RegExp {
    let index = pipeline.getStepIndex(this);
    if (index === -1)
      throw new Error("Invalid step index: step not found on pipeline " + pipeline.id);
    let hasMoreSteps = index < pipeline.getSteps().length - 1;
    // console.log("Has more steps", hasMoreSteps, this.id, this.pipeline.id);
    return new RegExp(this._terminationLabel ? this._terminationLabel :
      hasMoreSteps ? pipeline.getStep(index + 1).id : this.id, 'g')
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkLogStep(callback?) {
    let completed: boolean = false;
    do {
      completed = this.isTerminated();
      if (!completed)
        await this.sleep(50);
    } while (!completed);
    if (callback)
      callback();
  }

}
