import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CloudProvider } from "../../../shared/service/deployer/cloud-provider";
import { BaseProviderCredentialsComponent } from "../base-provider-credentials/base-provider-credentials.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OpenStackMetadataService } from "../../../shared/service/cloud-provider-metadata/open-stack-metadata.service";
import { OpenStackCredentials } from "../../../shared/service/cloud-provider-metadata/OpenStackCredentials";

@Component({
  selector: 'ph-preconfigured-openstack-provider-credentials',
  templateUrl: './preconfigured-openstack-provider-credentials.component.html',
  styleUrls: ['./preconfigured-openstack-provider-credentials.component.scss']
})
export class PreconfiguredOpenstackProviderCredentialsComponent extends BaseProviderCredentialsComponent {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  username: string = "";
  domainName: string = "";
  projectName: string = "";
  projectId: string = "";
  hidePassword: boolean = true;

  constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef,
              private providerMetadataService: OpenStackMetadataService) {
    super(fb, cdRef);
  }

  buildForm(): FormGroup {
    //console.log("[DEBUG] ==== PreconfiguredOpenstackProviderCredentialsComponent building form with these cloud provider parameters: ===  \n%O",
    //  this.cloudProvider.parameters);
    let cc: OpenStackCredentials = OpenStackMetadataService.parseRcFile(this.cloudProvider.parameters.rc_file);
    this.domainName = cc.domainName;
    this.projectName = cc.tenantOrProjectName;
    this.projectId = cc.tenantOrProjectId;
    return this.fb.group({
      'username': ['', Validators.required],
      'password': ['', [Validators.required]],
      'domainName': ['', []],
      'projectName': ['', []],
      'projectId': ['', []]
    });
  }

  get formErrors(): {} {
    return {
      'username': '',
      'password': '',
      'domainName': '',
      'projectName': '',
      'projectId': ''
    };
  }

  onValueChanged(data?) {
    super.onValueChanged(data);

    // update rcFile
    OpenStackMetadataService.updateRcFile(this.cloudProvider, {
      username: this.username,
      domainName: this.domainName,
      projectName: this.projectName,
      projectId: this.projectId
    });
    //console.log("[DEBUG] updated RC file: %O", this.cloudProvider.parameters.rc_file);

    // update other provider parameters
    let cc: OpenStackCredentials = OpenStackMetadataService.parseRcFile(this.cloudProvider.parameters.rc_file)
    this.cloudProvider.parameters.tenant_name = cc.tenantOrProjectName;
    this.cloudProvider.parameters.tenant_id = cc.tenantOrProjectId;
    this.cloudProvider.parameters.url = cc.authorizationEndPoint;
    //console.log("[DEBUG] set additional parameters:  %O", this.cloudProvider.parameters);
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
      },
      'domainName': {
        'required': 'The Domain Name is required.'
      },
      'projectName': {
        'required': 'The Project Name is required.'
      },
      'projectId': {
        'required': 'The Project Id is required.'
      }
    };
  }

}
