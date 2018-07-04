import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AwsRegion } from "../../aws-region";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CloudProvider } from "../../cloud-provider";
import { BaseProviderCredentialsComponent } from "../base-provider-credentials/base-provider-credentials.component";
import { GcpMetadataService } from "../../../shared/service/cloud-provider-metadata/gcp-metadata.service";

@Component({
  selector: 'ph-gcp-provider-credentials',
  templateUrl: './gcp-provider-credentials.component.html',
  styleUrls: ['./gcp-provider-credentials.component.scss']
})
export class GcpProviderCredentialsComponent extends BaseProviderCredentialsComponent {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  // Form Settings
  form: FormGroup;
  formControls = {};
  formErrors = {
    'credentials': ''
  };
  validationMessages = {
    'credentials': {
      'required': 'Access Key ID is required.'
    }
  };

  // Auxiliary data
  _gcp_region: AwsRegion[];

  constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef,
              private providerMetadataService: GcpMetadataService) {
    super(fb, cdRef);
    this.providerMetadataService.getRegions().subscribe((regions) => {
      this._gcp_region = regions;
    });
    this.providerMetadataService.loadRegions(null);
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): FormGroup {
    this.formControls = {
      'credentials': new FormControl('', [Validators.required])
    };
    this.form = this.fb.group(this.formControls);
    this.form.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
    return this.form;
  }

  onFileChanged(fileInput) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.cloudProvider.credential.rc_file = e.target.result;
      };
      reader.readAsText(fileInput.target.files[0]);
    }
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    // clean old errors
    this.cleanErrors();
    // validate form
    const form = this.form;
    for (const field of Object.keys(this.formErrors)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
      // extract project ID
      try {
        this.cloudProvider.credential.tenant_name = this.extractProjectName();
      } catch (e) {
        this.cloudProvider.credential.tenant_name = null;
        this.formErrors["credentials"] = "File not valid: " + e.message;
        form.controls['credentials'].setErrors({"invalid": true})
        this.addError("Invalid Credential File!");
      }
    }
  }

  onSubmit() {
    this.cloudProvider.credential.access_key_id = this.form.value['credentials'];
    this.cloudProviderChange.emit(this.cloudProvider);
  }


  private extractProjectName(): string {
    let projectName = null;
    let credentialsText = this.form.value['credentials'];
    if (credentialsText) {
      let credentials = JSON.parse(credentialsText);
      if (credentials) {
        projectName = credentials.project_id;
      }
    }
    return projectName;
  }

  validateCredentials(onSuccess?, onError?) {
  }
}
