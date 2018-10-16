import { Pipeline } from "./pipeline";
import { PipelineStatus } from "./pipeline-status";
import { Deployment as PhnDeployment } from "./deployment";
import { LogSearchPipelineStep } from "./log-search-pipeline-step";
import { PipelineStep } from "./pipeline-step";
import { DeployementService } from "./deployement.service";
import { Response } from "@angular/http";
import { pipeDef } from "@angular/core/src/view";

export class PhenoMeNalPipeline extends Pipeline {

  private readonly deployment: PhnDeployment;
  private readonly deployer: DeployementService;

  constructor(deployer: DeployementService, deployment: PhnDeployment, id?: string, description?: string) {
    super(id ? id : deployment.configurationName, description ? description : "PhenoMeNal CRE Deployment");
    this.deployer = deployer;
    this.deployment = deployment;
    PhenoMeNalPipeline.initPipeline(this);
  }

  private static initPipeline(pipeline: PhenoMeNalPipeline) {
    let deployment: PhnDeployment = pipeline.deployment;
    pipeline.setErrorHandler(pipeline.processError);
    pipeline.getDeploymentStatusAsObservable().subscribe((status: PipelineStatus) => {
      let progress = Math.round(pipeline.getProgress());
      let step: PipelineStep = pipeline.getCurrentStep();
      console.log(step, status, pipeline, progress);
      deployment.statusTransition = {
        'transition': deployment.status,
        'task': pipeline.getCurrentStep().description,
        'step': step && step.description !== step.description ? step.description : "",
        'progress': progress,
        'stepNumber': pipeline.getCurrentStepIndex() + 1,
        'numberOfSteps': pipeline.getSteps().length
      };
      console.log("EstimatedTime", step.estimatedTime);
      console.log("Update progress", deployment.statusTransition);
    });

    deployment.getDeployLogsAsObservable().subscribe((logs) => {
    });
  }

  public static buildPipeline(deployer: DeployementService, deployment: PhnDeployment,
                              id?: string, description?: string): PhenoMeNalPipeline {
    let pipeline: PhenoMeNalPipeline = new PhenoMeNalPipeline(deployer, deployment, id, description);
    PhenoMeNalPipeline.addDeploymentCreationPipeline(pipeline, deployment.status!== undefined);
    PhenoMeNalPipeline.addDeploymentConfigurationPipelines(pipeline);
    return pipeline;
  }

  private static addDeploymentCreationPipeline(pipeline: PhenoMeNalPipeline, setTerminated: boolean = false) {
    let deployer: DeployementService = pipeline.deployer;
    pipeline.addStep(new PipelineStep("cpp",
      (deployment: PhnDeployment, callback) => deployer.registerCloudProviderParameters(deployment, callback),
      "Creating CloudProviderParameters", 2));
    pipeline.addStep(new PipelineStep("cdp",
      (deployment: PhnDeployment, callback) => deployer.registerDeploymentParameter(deployment, callback),
      "Creating DeploymentParameters", 2));
    pipeline.addStep(new PipelineStep("cdc",
      (deployment: PhnDeployment, callback) => deployer.registerConfiguration(deployment, callback),
      "Creating Deployment Configuration", 2));
    pipeline.addStep(new PipelineStep("obs",
      (deployment: PhnDeployment, callback) => deployer.verifyObsoleteApplications(deployment, callback, pipeline),
      "Checking for obsolete PhenoMeNal application", 2));
    pipeline.addStep(new PipelineStep("cea",
      (deployment: PhnDeployment, callback) => deployer.checkExistingApplications(deployment, callback, pipeline),
      "Checking Existing Applications", 2));
    pipeline.addStep(new PipelineStep("ced",
      (deployment: PhnDeployment, callback) => deployer.checkExistingDeployments(deployment, callback, pipeline),
      "Checking Existing Deployments", 2));
    pipeline.addStep(new PipelineStep("rea",
      (deployment: PhnDeployment, callback) => deployer.deRegisterApplication(deployment, callback),
      "Remove Existing Application", 2));
    pipeline.addStep(new PipelineStep("aa",
      (deployment: PhnDeployment, callback) => deployer.registerApplication(deployment, callback),
      "Adding Application", 2));
    pipeline.addStep(new PipelineStep("rd",
      (deployment: PhnDeployment, callback) => deployer.registerDeployment(deployment, callback),
      "Register Deployment", 2));
    if (setTerminated) {
      for (let s of pipeline.getSteps()) {
        s.skip = true;
      }
    }
  }

  private static addDeploymentConfigurationPipelines(pipeline: PhenoMeNalPipeline) {
    let deployment: PhnDeployment = pipeline.deployment;

    // Terraform step
    pipeline.addStep(new LogSearchPipelineStep(
      "terraform", "Creating machines",
      90, deployment, pipeline, "PLAY")
    );

    // Network configuration Pipeline
    let networkPipelineSteps = {
      "wait for server to respond on ssh port": 10,
      "wait for server to respond on ssh port - second check": 10,
      "wait until for cloud-init to finish on master": 10,
      "verify that master initialized ok": 10,
      "wait for all nodes to join the master": 10,
      "delete clusterrolebinding permissive-binding RBAC-workaround": 2,
      "create clusterrolebinding permissive-binding RBAC-workaround": 2,
      "untaint master": 10,
      "flannel-network : install flannel-network": 10,
      "wait-kube-dns : get kube-dns ready status": 10,
      "start-helm : start helm": 5,
      "start-helm : wait for tiller-deploy ready status": 5,
      "start-helm : add KubeNow Helm repository": 5,
      "traefik : create traefik directory": 10,
      "traefik : copy traefik config file": 10,
      "traefik : delete configmap": 2,
      "traefik : create configmap from traefik config file": 2,
      "traefik : copy traefik DaemonSet configuration": 10,
      "traefik : start traefik DaemonSet": 10,
      "traefik : get desired pod count": 10,
      "traefik : wait for DaemonSet to be Ready": 10
    };
    let networkPipeline = new Pipeline("network",
      "Configuring network");
    for (let ns in networkPipelineSteps)
      networkPipeline.addStep(new LogSearchPipelineStep(ns, ns, networkPipelineSteps[ns], deployment, networkPipeline));
    pipeline.addStep(networkPipeline);

    let glusterFsPipelineSteps = {
      "heketi-gluster : taint gluster nodes": 15,
      "heketi-gluster : create heketi yaml directory": 15,
      "heketi-gluster : copy heketi configuration": 15,
      "heketi-gluster : start heketi": 15,
      "heketi-gluster : wait for heketi to be Running": 15,
      "heketi-gluster : wait for heketi to be Ready": 15,
      "heketi-gluster : create gluster KubeNow yaml directory": 15,
      "heketi-gluster : copy gluster DaemonSet configuration": 15,
      "heketi-gluster : create gluster DaemonSet": 15,
      "heketi-gluster : wait for gluster DaemonSet to be Running": 15,
      "heketi-gluster : wait for gluster DaemonSet to be Ready": 15,
      "heketi-gluster : retrieve gluster-pod IPs": 15,
      "heketi-gluster : set fact enpoint_list": 15,
      "heketi-gluster : retrieve gluster-server nodenames": 15,
      "heketi-gluster : set fact host_list": 15,
      "heketi-gluster : combine host-list with endpoint-list": 15,
      "heketi-gluster : render topology": 15,
      "heketi-gluster : retrieve heketi endpoint": 15,
      "heketi-gluster : set fact get_heketi_endpoint": 15,
      "heketi-gluster : apply topology-file to heketi": 15,
      "heketi-gluster : set fact glusternode_count": 15,
      "heketi-gluster : set fact volumetype": 15,
      "heketi-gluster : render storage-class": 15,
      "heketi-gluster : create storage-class": 15,
      "heketi-gluster : render object-store storage-class": 15,
      // TODO: disambiguate label
      // "heketi-gluster : create storage-class": 15
    };
    let glusterPipeline = new Pipeline("gluster",
      "Configuring Gluster FS ");
    for (let ns in glusterFsPipelineSteps)
      glusterPipeline.addStep(new LogSearchPipelineStep(ns, ns, glusterFsPipelineSteps[ns], deployment, glusterPipeline));
    pipeline.addStep(glusterPipeline);


    let pvcPipelineSteps = {
      "pvc : create pvc yaml directory": 105,
      "pvc : template galaxy-pvc-pvc": 105,
      "pvc : create galaxy-pvc-pvc": 105,
      "wait for all pods to be ready/running": 105
    };
    let pvcPipeline = new Pipeline("pvc",
      "Configuring Kubernetes PVC ");
    for (let ns in pvcPipelineSteps)
      pvcPipeline.addStep(new LogSearchPipelineStep(ns, ns, pvcPipelineSteps[ns], deployment, pvcPipeline));
    pipeline.addStep(pvcPipeline);


    let installPipelineSteps = {
      "add jupyter repo": 40,
      "install jupyter": 40,
      "template luigi deployment file": 40,
      "deploy luigi": 40,
      "create dashboard yaml directory": 40,
      "delete dashboard secret": 40,
      "create dashboard password secret": 40,
      "copy dashboard deployment file": 40,
      "apply dashboard": 40,
      "install heapster": 40,
      "add galaxy repo": 40,
      "install galaxy": 40
    };
    let installPipeline = new Pipeline("install-services",
      "Adding repos and services");
    for (let ls in installPipelineSteps)
      installPipeline.addStep(new LogSearchPipelineStep(ls, ls, installPipelineSteps[ls], deployment, installPipeline));
    pipeline.addStep(installPipeline);

    let waitForServicesPipelineSteps = {
      "wait until jupyter container is ready": 720,
      "git clone mtbls233": 720,
      "wait for notebook": 720,
      "wait for luigi": 720,
      "wait for galaxy": 1200
    };
    let waitForServicesPipeline = new Pipeline("waitForServices",
      "Waiting for services");
    for (let ls in waitForServicesPipelineSteps)
      waitForServicesPipeline.addStep(
        new LogSearchPipelineStep(
          ls, ls, waitForServicesPipelineSteps[ls], deployment, waitForServicesPipeline,
          ls === "wait for galaxy" ? "localhost\\s+:\\s+ok" : null)
      );
    pipeline.addStep(waitForServicesPipeline);

    pipeline.addStep(new PipelineStep("end", (deployment, callback) => {
      callback();
    }, "Configuration completed!", 0));
  }

  private processError(deploymentInstance: PhnDeployment, error) {
    let errMsg = error;
    let ej = error;
    console.error(error);
    if (error instanceof Response) {
      console.log("Response", error);
      ej = error.json();
    }
    if (typeof ej === 'object') {
      console.log("Error object", ej);
      let message = "";
      if (Array.isArray(ej)) {
        for (let e of ej) {
          message += e.message + " ";
        }
      }
      console.log(message);
      errMsg = message;
    }
    // set error info
    deploymentInstance.errorCause = errMsg;
    return error;
  }
}
