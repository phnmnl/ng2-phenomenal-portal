import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AwsRegion } from '../aws-region';

@Component({
  selector: 'ph-gcp-setup',
  templateUrl: './gcp-setup.component.html',
  styleUrls: ['./gcp-setup.component.scss']
})
export class GcpSetupComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();
  form: FormGroup;
  _gcp_region: AwsRegion[];


  formErrors = {
    'region': '',
    'accessKeyId': '',
    'tenantName': ''
  };

  validationMessages = {
    'region': {
      'required': 'Region is required.'
    },
    'accessKeyId': {
      'required': 'Access Key ID is required.'
    },
    'tenantName': {
      'required': 'Project ID is required.'
    }
  };

  constructor(private fb: FormBuilder) {
    this._gcp_region = [
      {value: 'us-west1-a', displayValue: 'Western US'},
      {value: 'us-central1-a', displayValue: 'Central US'},
      {value: 'us-east1-b', displayValue: 'Eastern US'},
      {value: 'europe-west1-b', displayValue: 'Western Europe'},
      {value: 'asia-east1-a', displayValue: 'Eastern Asia-Pacific'},
      {value: 'asia-northeast1-a', displayValue: 'Northeastern Asia-Pacific'}
    ];
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'region': ['', Validators.required],
      'accessKeyId': ['', Validators.required],
      'tenantName': ['', [Validators.required]]
    });

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
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
    }
  }

  onSubmit() {
    this.cloudProvider.isSelected = 2;
    this.cloudProvider.credential.default_region = this.form.value['region'];
    this.cloudProvider.credential.access_key_id = this.form.value['accessKeyId'];
    this.cloudProvider.credential.tenant_name = this.form.value['tenantName'];

    this.cloudProviderChange.emit(this.cloudProvider);
  }

}
