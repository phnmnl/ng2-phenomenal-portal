import { ChangeDetectorRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { CloudProvider } from "../../../shared/service/deployer/cloud-provider";
import { Observable, Subject } from "rxjs";

export abstract class BaseProviderCredentialsComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();
  @Output() form: FormGroup;

  private _errorsAsObservable = new Subject<object>();

  errors = [];

  protected constructor(protected fb: FormBuilder, protected cdRef: ChangeDetectorRef) {
  }


  abstract buildForm(): FormGroup;

  abstract get formErrors(): {};

  abstract get validationMessages(): {};

  get errorsAsObservable(): Observable<any> {
    return this._errorsAsObservable.asObservable();
  }

  public abstract validateCredentials(onSuccess?, onError?);

  ngOnInit() {
    this._buildForm();
    this.ngAfterViewChecked();
  }


  _buildForm(): void {

    this.form = this.buildForm();

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }


  onValueChanged(data?) {
    if (!this.form) {
      return;
    }
    this.cleanErrors();
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
    console.log("Submitting form");
    let parameters = this.cloudProvider.parameters;
    if (parameters.default_region && parameters.access_key_id && parameters.secret_access_key) {
      this.validateCredentials();
    }
  }


  public onKeyPressed(event) {
    if (event.keyCode == 13) {
      if (this.form.valid)
        this.onSubmit();
      return false;
    }
  }


  protected cleanErrors() {
    this.errors.splice(0, this.errors.length);
    this.updateErrors();
  }

  protected addError(error: string) {
    this.errors.push(error);
    this.updateErrors();
  }

  protected updateErrors() {
    this._errorsAsObservable.next(this.errors);
  }
}
