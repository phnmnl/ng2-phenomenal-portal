import { PipelineStep } from "./pipeline-step";

export class PipelineStatus {

  private sum: number = 0;
  private _currentStep: PipelineStep;
  private _steps: Array<PipelineStep> = [];


  constructor() {
    this.sum = 0;
  }

  nextStep(step: PipelineStep) {
    if (step) {
      this._steps.push(step);
      this._currentStep = step;
    }
  }



  get currentStep(): PipelineStep {
    return this._currentStep;
  }

  get steps(): Array<PipelineStep> {
    return this._steps;
  }
}
