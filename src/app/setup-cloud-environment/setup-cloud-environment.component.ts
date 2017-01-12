import { Component, OnInit } from '@angular/core';
import {ApplicationService, CredentialService, ErrorService, TokenService} from 'ng2-cloud-portal-service-lib';

@Component({
  selector: 'ph-setup-cloud-environment',
  templateUrl: './setup-cloud-environment.component.html',
  styleUrls: ['./setup-cloud-environment.component.css']
})
export class SetupCloudEnvironmentComponent implements OnInit {

  private _phenomenal_logo = 'assets/img/logo/default_app.png';
  private _openstack_logo = 'assets/img/logo/openstack_logo.png';
  private _aws_logo = 'assets/img/logo/aws_logo.png';

  public _isChosen: boolean = false;

  constructor(
    private _applicationService: ApplicationService,
    public credentialService: CredentialService,
    public tokenService: TokenService,
    public errorService: ErrorService,
  ) {

    // if (tokenService.getToken()) {
    //   this.getAllApplication();
    // }
  }

  ngOnInit() {
  }

  get phenomenal_logo(): string {
    return this._phenomenal_logo;
  }

  get openstack_logo(): string {
    return this._openstack_logo;
  }

  get aws_logo(): string {
    return this._aws_logo;
  }

  getAllApplication() {
    this._applicationService.getAll(
      this.credentialService.getUsername(),
      this.tokenService.getToken()
    ).subscribe(
      deployment  => {
        console.log('[RepositoryComponent] getAll %O', deployment);
      },
      error => {
        console.log('[RepositoryComponent] getAll error %O', error);
        this.errorService.setCurrentError(error);
        this.tokenService.clearToken();
        this.credentialService.clearCredentials();
      }
    );
  }

}
