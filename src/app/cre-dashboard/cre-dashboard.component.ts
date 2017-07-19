import { Component, OnInit } from '@angular/core';
import {ApplicationService, DeploymentService, Deployment} from 'ng2-cloud-portal-service-lib';
import { CredentialService } from 'ng2-cloud-portal-service-lib';
import { ErrorService } from 'ng2-cloud-portal-service-lib';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import {Router} from '@angular/router';
import {Http} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {UserService} from '../shared/service/user/user.service';

@Component({
  selector: 'ph-cre-dashboard',
  templateUrl: './cre-dashboard.component.html',
  styleUrls: ['./cre-dashboard.component.css']
})
export class CreDashboardComponent implements OnInit {

  private _galaxy_icon = 'assets/img/logo/galaxy.png';
  private _text = 'http://public.phenomenal-h2020.eu/';
  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';
  private _gce_logo = 'assets/img/logo/gce_logo.png';

  get phenomenal_logo(): string {
    return this._phenomenal_logo;
  }

  get gce_logo(): string {
    return this._gce_logo;
  }

  get openstack_logo(): string {
    return this._openstack_logo;
  }

  get aws_logo(): string {
    return this._aws_logo;
  }

  deploymentServerList: Deployment[];
  isDeployment = false;
  isClickedOnce = false;

  constructor(
    private _applicationService: ApplicationService,
    private _deploymentService: DeploymentService,
    private _tokenService: TokenService,
    public credentialService: CredentialService,
    public errorService: ErrorService,
    public userService: UserService,
    private router: Router,
    private http: Http
  ) {
    this.isUserExist(this.credentialService.getUsername());
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
            deployment['isMore'] = false;
            deployment['isGalaxy'] = true;
            deployment['isJupyter'] = false;
            for (let i = 0; i < deployment.assignedParameters.length; i++) {
              if (deployment.assignedParameters[i]['parameterName'] === 'cluster_prefix') {
                deployment['galaxyUrlName'] = 'http://galaxy.' + deployment.assignedParameters[i]['parameterValue'] + '.phenomenal.cloud';
                deployment['jupyterUrlName'] = 'http://notebook.' + deployment.assignedParameters[i]['parameterValue'] + '.phenomenal.cloud';
              }
              if (deployment.assignedParameters[i]['parameterName'] === 'galaxy_admin_email') {
                deployment['galaxyAdminEmail'] = deployment.assignedParameters[i]['parameterValue'];
              }
              if (deployment.assignedParameters[i]['parameterName'] === 'galaxy_admin_password') {
                deployment['galaxyAdminPassword'] = deployment.assignedParameters[i]['parameterValue'];
              }
              if (deployment.assignedParameters[i]['parameterName'] === 'jupyter_password') {
                deployment['jupyterPassword'] = deployment.assignedParameters[i]['parameterValue'];
              }
            }
          });
        }
      }
    );
  }

  pingDomain(url, time, callback) {
    const jupyterStatus = Observable.interval(time)
      .switchMap(() => this.http.get('https://cors-anywhere.herokuapp.com/' + url)).map((data) => data)
      .subscribe((data) => {
          if (data.status === 200) {

            jupyterStatus.unsubscribe();
            return callback();
          }
        },
        (error) => {
          return this.pingDomain(url, 10000, callback);
        });
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
        this._deploymentService.delete(this.credentialService.getUsername(), this._tokenService.getToken(),
          deployment).subscribe(
          res1 => {
            if (res1 === 200) {
              this.getAllDeploymentServer((deploymentStatus) => {
                if (deploymentStatus.length === 0) {
                  this.getAllApplication( (app) => {
                    this.removeApplication(app, (done) => {
                      location.reload();
                    });
                  });
                } else {
                  location.reload();
                }
              });
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

  removeApplication(application, callback) {
    this._applicationService.delete(this.credentialService.getUsername(),
      this._tokenService.getToken(), application[0]).subscribe(
      res => {
        console.log('[RepositoryComponent] got response %O', res);
        callback(res);
      },
      error => {
        console.log('[RepositoryComponent] error %O', error);
        this.errorService.setCurrentError(error);
        callback(error);
      }
    );
  }

  getAllApplication(callback) {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this._tokenService.getToken()
    ).subscribe(
      app  => {
        callback(app);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        callback(error);
      }
    );
  }

  private isUserExist(id: string) {

    this.userService.get(id).subscribe(
      (res) => {
        // if (res['data']) {
        //   this.router.navigateByUrl('cloud-research-environment');
        // }
        if (res['error']) {
          this.router.navigateByUrl('term-and-condition');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
