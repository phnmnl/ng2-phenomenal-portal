import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OpenStackCredentials } from "../../../shared/service/cloud-provider-metadata/OpenStackCredentials";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OpenStackMetadataService } from "../../../shared/service/cloud-provider-metadata/open-stack-metadata.service";
import { CloudProvider } from "../../cloud-provider";
import { OpenstackConfig } from "../../../shared/service/cloud-provider-metadata/openstack-config";
import { passwordValidator } from "../../validator";
import { BaseProviderCredentialsComponent } from "../base-provider-credentials/base-provider-credentials.component";

@Component({
  selector: 'ph-openstack-provider-credentials',
  templateUrl: './openstack-provider-credentials.component.html',
  styleUrls: ['./openstack-provider-credentials.component.scss']
})
export class OpenstackProviderCredentialsComponent extends BaseProviderCredentialsComponent {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  // template properties
  form: FormGroup;
  hidePassword: boolean = true;

  formErrors = {
    'password': '',
    'rcFile': ''
  };

  validationMessages = {
    'password': {
      'required': 'Password is required.'
    },
    'rcFile': {
      'required': 'RC file is required.'
    }
  };

  constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef,
              private cpm: OpenStackMetadataService) {
    super(fb, cdRef);
  }


  ngOnInit() {
    this.buildForm();
  }

  buildForm(): FormGroup {
    let form = this.fb.group({
      'rcFile': [this.cloudProvider.credential.rc_file, [Validators.required]],
      'password': ['', [Validators.required]]
    });
    form.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
    this.form = form;
    return form;
  }


  onFileChanged(fileInput) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (e: any) => {
        this.cloudProvider.credential.rc_file = e.target.result;
        this.cloudProvider.credential.tenant_name = this.cpm.getTenantOrProjectName(this.cloudProvider);
        this.cloudProvider.credential.url = this.cpm.getAuthorizationEndPoint(this.cloudProvider);
      };

      reader.readAsText(fileInput.target.files[0]);
    }
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;
    console.log("On change event...", data);

    for (const field of Object.keys(this.formErrors)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      console.log("Checking control", field, control);
      if (control)
        console.log("Checking control", field, control.dirty, control.valid);
      if (control && control.dirty && !control.valid) {
        console.log("Checking control", field, control.dirty, control.valid);
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
          console.error(control.errors[key]);
        }
      }
    }
  }

  validateCredentials(onSuccess?, onError?) {
    this.cpm.authenticate(this.cloudProvider).subscribe((data) => {
      console.log("Received results", data);
    }, (error) => {
      console.log("ERROR on authenticate", error);
    });
  }
}
