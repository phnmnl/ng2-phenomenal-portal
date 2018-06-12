import { DeploymentStatusTransition } from "./deployment-status-transition";

export class DeploymentStatus {

  startedTime: number;
  deployedTime: number;
  failedTime: number;
  destroyedTime: number;
  transition: DeploymentStatusTransition;
}
