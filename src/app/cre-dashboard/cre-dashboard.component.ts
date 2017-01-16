import { Component, OnInit } from '@angular/core';
import {DeploymentService, Deployment} from 'ng2-cloud-portal-service-lib';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { ErrorService } from 'ng2-cloud-portal-service-lib';
import { TokenService } from 'ng2-cloud-portal-service-lib';

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css']
})
export class CreDashboardComponent implements OnInit {

  private _galaxy_icon = 'assets/img/logo/galaxy.png';
  private _text = 'http://public.phenomenal-h2020.eu/';

  deploymentServerList: Deployment[];
  isEmptyDeployment: boolean = false;
  isClickedOnce: boolean = false;
  isConfirmationDialogue = false;

  constructor(
    private _deploymentService: DeploymentService,
    private _tokenService: TokenService,
    public credentialService: CredentialService,
    public errorService: ErrorService
  ) {
    this.getAllDeploymentServer(
      (result) => {
        console.log(result);
        if (result.length === 0) {
          this.isEmptyDeployment = true;
        }
        this.deploymentServerList = result;
      }
    );
  }

  get galaxy_icon(): string {
    return this._galaxy_icon;
  }

  get text(): string {
    return this._text;
  }

  ngOnInit() {
  }

  getAllDeploymentServer(callback) {
    this._deploymentService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()
    ).subscribe(
      deployment  => {
        console.log('[RepositoryComponent] getAll %O', deployment);
        callback(deployment);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  confirmRemoval(isRemoved: boolean) {
    this.isConfirmationDialogue = isRemoved;
  }

  remove(deployment: Deployment) {
    this.isClickedOnce = true;
    this._deploymentService.stop(this.credentialService.getUsername(), this._tokenService.getToken(),
      deployment).subscribe(
      res => {
        console.log('[Deployments] got response %O', res);
        this._deploymentService.delete(this.credentialService.getUsername(), this._tokenService.getToken(),
          deployment).subscribe(
          res1 => {
            console.log('[Deployments] got response %O', res1);
            if (res1 === 200) {
              location.reload();
            }
          },
          error => {
            console.log('[Deployments] error %O', error);
            this.errorService.setCurrentError(error);
          }
        );
      },
      error => {
        console.log('[Deployments] error %O', error);
        this.errorService.setCurrentError(error);
      }
    );
  }
}
