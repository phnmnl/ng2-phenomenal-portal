import { DeploymentStatusTransition } from "./deployment-status-transition";

export class DeploymentStatus {

  startedTime: number;
  deployedTime: number;
  failedTime: number;
  destroyedTime: number;
  transition: DeploymentStatusTransition;
  errorCause: string;
  instanceCount: number;
  totalDiskGb: number;
  totalRamGb: number;
  totalRunningTime: number;
  totalVcpus: number;
}
