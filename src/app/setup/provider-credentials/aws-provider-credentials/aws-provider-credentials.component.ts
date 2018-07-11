import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BaseDeploymentConfigurationParameters } from "../../../shared/service/deployer/base-deployment-configuration-parameters";
import { BaseProviderCredentialsComponent } from "../base-provider-credentials/base-provider-credentials.component";

import AWS = require('aws-sdk');
import { AWSError } from "aws-sdk/lib/error";
import { AwsRegion } from "../../aws-region";
import { Observable } from "rxjs";
import { CloudProviderMetadataService } from "../../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service";
import { AwsMetadataService } from "../../../shared/service/cloud-provider-metadata/aws-metadata.service";

@Component({
  selector: 'ph-aws-provider-credentials',
  templateUrl: './aws-provider-credentials.component.html',
  styleUrls: ['./aws-provider-credentials.component.scss']
})
export class AwsProviderCredentialsComponent extends BaseProviderCredentialsComponent {

  _aws_region;
  hideAccessKey: boolean = true;
  hideSecretKey: boolean = true;


  constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef,
              private providerMetadataService: AwsMetadataService) {
    super(fb, cdRef);
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.providerMetadataService.getRegions().subscribe((regions) => {
      this._aws_region = regions;
    });
  }

  get formErrors() {
    return {
      'accessKeyId': '',
      'secretAccessKey': ''
    };
  }

  get validationMessages() {
    return {
      'accessKeyId': {
        'required': 'Access Key ID is required.'
      },
      'secretAccessKey': {
        'required': 'Secret Access Key is required.'
      }
    };
  }


  buildForm(): FormGroup {
    return this.fb.group({
      'accessKeyId': ['', Validators.required],
      'secretAccessKey': ['', [Validators.required]]
    });
  }


  public validateCredentials(onSuccess?, onError?) {
    this.providerMetadataService.authenticate(this.cloudProvider).subscribe((data) => {
      console.log("Received results", data);
    }, (error) => {
      console.log("ERROR on authenticate", error);
    });
  }
}
