import { Subject } from "rxjs/Subject";

import { Observable } from "rxjs";
import { PipelineStatus } from "./pipeline-status";
import { PipelineStep } from "./pipeline-step";
import { Deployment } from "./deployment";
import { PipelineStepResult } from "./pipeline-step-result";


export class Pipeline extends PipelineStep {

  protected steps: Array<PipelineStep> = [];
  protected toSkip: Array<string> = [];
  protected currentStepIndex: number = -1;
  protected currentStep: PipelineStep;
  protected currentStatus: PipelineStatus = new PipelineStatus();
  protected deploymentStatus = new Subject<PipelineStatus>();
  private errorHandler = null;

  constructor(id: string, description: string) {
    super(id, null, description, 0);
  }

  public isTerminated(): boolean {
    for (let s of this.getSteps()) {
      if (!s.isTerminated()) {
        return false;
      }
    }
    return true;
  }

  private getEstimatedTimeOfCompletedSteps(): number {
    let completed: number = 0;
    let completedSteps = this.steps
      .filter(s => (s instanceof Pipeline) || s.isTerminated());
    if (completedSteps.length > 0)
      completed = completedSteps
        .map(s => s instanceof Pipeline ? s.getEstimatedTimeOfCompletedSteps() : s.estimatedTime)
        .reduce((sum, val) => sum + val);
    return completed;
  }

  public getProgress(): number {
    console.log("Computing progress of " + this.id);
    let completed: number = 0;
    let completedSteps = this.steps
      .filter(s => (s instanceof Pipeline) || s.isTerminated());
    if (completedSteps.length > 0)
      completed = completedSteps
        .map(s => s instanceof Pipeline ? s.getEstimatedTimeOfCompletedSteps() : s.estimatedTime)
        .reduce((sum, val) => sum + val);
    return (completed / this.estimatedTime) * 100;
  }

  get estimatedTime(): number {
    return this.steps
      .map(s => s.estimatedTime)
      .reduce((sum, val) => sum + val);
  }

  public addStep(step: PipelineStep) {
    this.steps.push(step);
    if (step instanceof Pipeline) {
      step.getDeploymentStatusAsObservable().subscribe((status: PipelineStatus) => {
        this.deploymentStatus.next(status);
      });
    }
  }

  public removeStep(step: PipelineStep) {
    let index = this.steps.indexOf(step);
    if (index !== -1)
      this.steps.splice(index, 1);
  }

  public getSteps() {
    return this.steps;
  }

  public skipStep(stepId: string) {
    this.toSkip.push(stepId);
  }

  public getCurrentStep(): PipelineStep {
    return this.currentStep;
  }

  public hasMoreSteps(): boolean {
    return this.getCurrentStepIndex() < this.steps.length - 1;
  }

  public getLastStep(): PipelineStep {
    return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
  }

  public getNextStep(): PipelineStep {
    return this.hasMoreSteps() ? this.steps[this.getCurrentStepIndex() + 1] : null;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getStepIndex(step: PipelineStep) {
    return this.steps.indexOf(step);
  }

  public getStep(index: number): PipelineStep {
    if (index < 0 || index >= this.steps.length)
      throw new Error("Invalid index: " + index);
    return this.steps[index];
  }

  public getDeploymentStatus(): PipelineStatus {
    return this.currentStatus;
  }

  public getDeploymentStatusAsObservable(): Observable<PipelineStatus> {
    return this.deploymentStatus.asObservable();
  }

  public setErrorHandler(handler) {
    this.errorHandler = handler;
  }

  protected updateStatus(step: PipelineStep) {
    if (step) {
      this.currentStep = step;
      this.currentStatus.nextStep(step);
      this.deploymentStatus.next(this.currentStatus);
    }
  }

  public exec(deployment: Deployment, callback) {
    this.next(deployment, callback);
  }

  public seek(deployment: Deployment) {
    console.log("Start seek function", this);
    let step: PipelineStep;
    let toSkip = false;
    if (this.steps && this.steps.length > 0 && this.currentStepIndex < this.steps.length - 1) {
      do {
        this.currentStepIndex++;
        console.log("Checking step", this.currentStepIndex);
        step = this.steps[this.currentStepIndex];
        toSkip = this.toSkip.indexOf(step.id) !== -1;
        if (toSkip) {
          console.log("Skipping step: ", step.id, step.description);
        }
        if (step.isTerminated()) {
          console.log("Skipping step because terminated", step);
          this.updateStatus(step);
          toSkip = true;
        }
      } while (toSkip && this.currentStepIndex < this.steps.length - 1);
      if (step && !toSkip) {
        if (step instanceof Pipeline) {
          step.seek(deployment);
        }
        // notice that exec starts incrementing 'currentStep'
        this.updateStatus(step);
        this.currentStepIndex--;
      } else {
        this.setTerminated(null);
        this.updateStatus(step);
      }
    } else {
      this.setTerminated(null);
      this.updateStatus(step);
    }
    console.log("END seek function");
  }

  private next(deployment: Deployment, callback) {
    let step: PipelineStep;
    let toSkip = false;
    setTimeout(() => {
      this.setStarted();
      if (this.steps && this.steps.length > 0 && this.currentStepIndex < this.steps.length - 1) {
        do {
          this.currentStepIndex++;
          console.log("Checking step", this.currentStepIndex);
          step = this.steps[this.currentStepIndex];
          toSkip = this.toSkip.indexOf(step.id) !== -1;
          console.log("To SKip", toSkip);
          if (toSkip) {
            console.log("Skipping step: ", step.id, step.description);
          }
        } while (toSkip && this.currentStepIndex < this.steps.length - 1);
        if (step && !toSkip) {
          this.updateStatus(step);
          step.exec(deployment, (result: PipelineStepResult) => {
            if (result && result.error) {
              console.log("Error", result.error, "Pipeline interrupted");
              if (this.errorHandler)
                this.errorHandler(result.error);
            } else {
              this.next(deployment, callback);
            }
          });
        } else {
          this.setTerminated(null, callback);
          this.updateStatus(step);
        }
      } else {
        this.setTerminated(null, callback);
        this.updateStatus(step);
      }
    }, 500);
  }
}
