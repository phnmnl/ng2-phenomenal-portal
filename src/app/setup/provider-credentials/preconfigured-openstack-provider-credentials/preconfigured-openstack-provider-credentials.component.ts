import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CloudProvider } from "../../../shared/service/deployer/cloud-provider";
import { BaseProviderCredentialsComponent } from "../base-provider-credentials/base-provider-credentials.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OpenStackMetadataService } from "../../../shared/service/cloud-provider-metadata/open-stack-metadata.service";

@Component({
  selector: 'ph-preconfigured-openstack-provider-credentials',
  templateUrl: './preconfigured-openstack-provider-credentials.component.html',
  styleUrls: ['./preconfigured-openstack-provider-credentials.component.scss']
})
export class PreconfiguredOpenstackProviderCredentialsComponent extends BaseProviderCredentialsComponent {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  username: string = "";
  hidePassword: boolean = true;

  constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef,
              private providerMetadataService: OpenStackMetadataService) {
    super(fb, cdRef);
  }

  buildForm(): FormGroup {
    return this.fb.group({
      'username': ['', Validators.required],
      'password': ['', [Validators.required]]
    });
  }

  get formErrors(): {} {
    return {
      'username': '',
      'password': ''
    };
  }

  onValueChanged(data?) {
    super.onValueChanged(data);

    // update tenanat name
    this.cloudProvider.credential.tenant_name = this.providerMetadataService.getTenantOrProjectName(this.cloudProvider);
    this.cloudProvider.credential.url = this.providerMetadataService.getAuthorizationEndPoint(this.cloudProvider);

    // update rcFile with username
    this.providerMetadataService.updateRcFile(this.cloudProvider, this.username);
    this.cloudProvider.credential.username = this.username;
  }

  validateCredentials(onSuccess?, onError?) {
    this.providerMetadataService.authenticate(this.cloudProvider).subscribe((data) => {
      console.log("Received results", data);
    }, (error) => {
      console.log("ERROR on authenticate", error);
    });
  }


  get validationMessages(): {} {
    return {
      'username': {
        'required': 'Username is required.'
      },
      'password': {
        'required': 'Password is required.'
      }
    };
  }

}
