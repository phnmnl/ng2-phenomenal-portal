import { Component, OnInit } from '@angular/core';
import {ApplicationService, DeploymentService, Deployment} from 'ng2-cloud-portal-service-lib';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { ErrorService } from 'ng2-cloud-portal-service-lib';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import {Router} from '@angular/router';

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css']
})
export class CreDashboardComponent implements OnInit {

  private _galaxy_icon = 'assets/img/logo/galaxy.png';
  private _text = 'http://public.phenomenal-h2020.eu/';

  deploymentServerList: Deployment[];
  isDeployment: boolean = false;
  isClickedOnce: boolean = false;

  constructor(
    private _applicationService: ApplicationService,
    private _deploymentService: DeploymentService,
    private _tokenService: TokenService,
    public credentialService: CredentialService,
    public errorService: ErrorService,
    private router: Router
  ) {

  }

  get galaxy_icon(): string {
    return this._galaxy_icon;
  }

  get text(): string {
    return this._text;
  }

  ngOnInit() {
    if (this._tokenService.getToken()) {
      this.getAllApplication((result) => {
        if (result.status === 401 || result.type === 'error') {
          this.logout();
        } else {
          this.getAllDeploymentServerWrapper();
        }
      });
    } else {
      this.logout();
    }
  }

  logout() {
    this._tokenService.clearToken();
    this.credentialService.clearCredentials();
    this.router.navigateByUrl('/login');
  }

  getAllDeploymentServerWrapper() {
    this.getAllDeploymentServer(
      (result) => {
        console.log(result);
        if (result.length === 0) {
          this.router.navigateByUrl('/cloud-research-environment/setup');
        }
        this.isDeployment = true;
        this.deploymentServerList = result;
        for (const deployment of this.deploymentServerList) {
          this.getStatus(deployment, (res) => {
            deployment['status'] = res.status;
            deployment['isDelete'] = false;
          });
        }
      }
    );
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


  getStatus(deployment: Deployment, callback) {

    this._deploymentService.getDeploymentStatus(
      this.credentialService.getUsername(),
      this._tokenService.getToken(),
      deployment).subscribe(
      res => {
        console.log('[Deployments] got status response %O', res);
        callback(res);
      },
      error => {
        console.log('[Deployments] status error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
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

  getAllApplication(callback) {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()
    ).subscribe(
      app  => {
        console.log('[RepositoryComponent] getAll %O', app);
        callback(app);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        callback(error);
      }
    );
  }
}
