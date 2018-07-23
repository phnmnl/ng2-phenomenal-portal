import { Component, EventEmitter, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  CredentialService,
  TokenService
} from 'ng2-cloud-portal-service-lib';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from '../shared/service/user/user.service';
import { Deployment } from "../shared/service/deployer/deployment";
import { CanComponentDeactivate } from "../shared/guard/CanDeactivateGuard";
import { DeployementService } from "../shared/service/deployer/deployement.service";
import { ModalDialogContentComponent } from "../shared/component/modal-dialog/modal-dialog.component";
import { Observable } from "rxjs";
import { CloudProviderCatalogService } from "../shared/service/cloud-provider-catalog/cloud-provider-catalog.service";

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreDashboardComponent extends CanComponentDeactivate implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;

  public openstack_logo = 'assets/img/logo/openstack_logo.png';
  public aws_logo = 'assets/img/logo/aws_logo.png';
  public gce_logo = 'assets/img/logo/gce_logo.png';
  public generic_cloud_logo = "assets/img/logo/generic_cloud_logo.png";

  public galaxy_logo = 'assets/img/logo/galaxy_square.png';
  public luigi_logo = 'assets/img/logo/luigi.png';
  public jupyter_logo = 'assets/img/logo/jupyter_square.png';

  private preconfigured_provider_logos = [];

  public error_icon = 'assets/img/error-icon.png';

  deploymentServerList: Deployment[];
  private _preconfiguredCloudProviderCollection: null;

  private onDestroyEvent = new EventEmitter<Deployment>();
  private onDeleteEvent = new EventEmitter<Deployment>();


  constructor(private modalService: NgbModal,
              private tokenService: TokenService,
              public credentialService: CredentialService,
              private catalogService: CloudProviderCatalogService,
              public userService: UserService,
              private router: Router,
              private deploymentManager: DeployementService) {
    super();
  }

  ngOnInit() {
    this.deploymentManager.getDeployments().subscribe((deployments) => {
      this.deploymentServerList = deployments;
      console.log("Updated deployments", deployments);
    }, (error) => {
      console.error("The current error", error);
      this.userService.logout();
    });

    this.catalogService.getPreconfiguredProviders().subscribe((providers) => {
      this._preconfiguredCloudProviderCollection = providers;
      for (let p of providers) {
        this.preconfigured_provider_logos[p.preset] = p.logo.path;
      }
      console.log("Preconfigured Provider logos", this.preconfigured_provider_logos, providers);
    });

    this.onDestroyEvent.subscribe((deployment) => {
      this.processDestroyDeployment(deployment);
    });

    this.onDeleteEvent.subscribe((deployment) => {
      this.processDeleteDeployment(deployment);
    });

    this.deploymentManager.updateDeployments();
  }

  ngOnDestroy() {
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    console.log("Checking if it can be unloaded");
    for (let d of this.deploymentServerList) {
      if (d.isStarting()) {
        let status = d.statusTransition;
        if (status) {
          console.log(status);
          if (status.stepNumber < 9) {
            console.warn("You cannot deactivate the current window");
            return false;
          }
        }
      }
    }
    console.log("the current window can be deactivated!");
    return true;
  }

  logout() {
    this.tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }


  enabledServices(deployment: Deployment) {
    return deployment && deployment["status"] === "RUNNING"
  }


  destroyDeployment(deployment: Deployment) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      CreDashboardComponent.clearErrors(deployment);
      this.onDestroyEvent.emit(deployment);
      modalRef.close();
    });
    modalRef.componentInstance.title = "Stop CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
  }

  private processDestroyDeployment(deployment: Deployment) {
    console.log("Destroying deployment...");
    this.deploymentManager.destroyDeployment(deployment);
  }

  public deleteDeployment(deployment: Deployment) {
    let modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.title = "Delete CRE '" + deployment.configurationName + "'";
    modalRef.componentInstance.body = "Are you sure?";
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      CreDashboardComponent.clearErrors(deployment);
      modalRef.close();
      this.onDeleteEvent.emit(deployment);
    });
  }

  public processDeleteDeployment(deployment: Deployment) {
    console.log("Deleting deployment ...");
    this.deploymentManager.deleteDeploymentConfiguration(deployment);
  }

  public isBoxOnLastColumn() {
    return (this.deploymentServerList.length + 1) % 3 === 0;
  }

  public getProviderLogo(deployment: Deployment) {
    if (!deployment.usePreset()) {
      if (deployment.useAwsProvider())
        return this.aws_logo;
      if (deployment.useOStackProvider())
        return this.openstack_logo;
      if (deployment.useGcpProvider())
        return this.gce_logo;
    } else {
      if (deployment.preset in this.preconfigured_provider_logos)
        return this.preconfigured_provider_logos[deployment.preset];
      return this.generic_cloud_logo;
    }
  }

  private static clearErrors(deployment: Deployment) {
    deployment.cleanErrors();
  }
}
