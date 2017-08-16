import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AwsRegion} from '../aws-region';
import {CloudProvider} from '../cloud-provider';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import { matchingPasswords } from '../validator';

@Component({
  selector: 'ph-aws-setup',
  templateUrl: './aws-setup.component.html',
  styleUrls: ['./aws-setup.component.scss']
})
export class AwsSetupComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();
  form: FormGroup;
  _aws_region: AwsRegion[];


  formErrors = {
    'region': '',
    'accessKeyId': '',
    'secretAccessKey': ''
  };

  validationMessages = {
    'region': {
      'required': 'Region is required.'
    },
    'accessKeyId': {
      'required': 'Access Key ID is required.'
    },
    'secretAccessKey': {
      'required': 'Secret Access Key is required.'
    }
  };

  constructor(private fb: FormBuilder) {
    this._aws_region = [
      { value: 'eu-west-1', displayValue: 'EU (Ireland)'},
      { value: 'eu-central-1', displayValue: 'EU (Frankfurt)'},
      // { value: 'eu-west-2', displayValue: 'EU (London)'},
      { value: 'us-east-1', displayValue: 'US East (N. Virginia)'},
      { value: 'us-east-2', displayValue: 'US East (Ohio)'},
      { value: 'us-west-1', displayValue: 'US West (N. California)'},
      { value: 'us-west-2', displayValue: 'US West (Oregon)'},
      { value: 'ca-central-1', displayValue: 'Canada (Central)'}
    ];
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {

    this.form = this.fb.group({
      'region': ['', Validators.required],
      'accessKeyId': ['', Validators.required],
      'secretAccessKey': ['', [Validators.required]]
    });

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }
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
    this.cloudProvider.credential.secret_access_key = this.form.value['secretAccessKey'];

    this.cloudProviderChange.emit(this.cloudProvider);
  }
}
