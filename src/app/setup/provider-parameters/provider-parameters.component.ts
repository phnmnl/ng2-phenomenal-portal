import { CloudProvider } from "../cloud-provider";
import { ErrorStateMatcher, MatButtonToggleChange } from "@angular/material";
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from "@angular/forms";
import { CloudProviderMetadataService } from "../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'ph-provider-parameters',
  templateUrl: './provider-parameters.component.html',
  styleUrls: ['./provider-parameters.component.scss']
})
export class ProviderParametersComponent implements OnInit {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  // Network Form Settings
  networkForm: FormGroup;
  externalNetworkControl: FormControl;
  ipPoolControl: FormControl;
  showNetworkSettings: boolean = false;

  // Base Form Settings
  simplifiedForm: FormGroup;
  sharedInstanceFormControl: FormControl;

  // Advanced Form Settings
  formAdvancedSettings: FormGroup;
  formErrors = {};
  formControls;
  showRegions: boolean = true;
  showAdvancedSettings: boolean = false;
  matcher = new MyErrorStateMatcher();
  formFields = {
    'region': "Region",
    'master_as_edge': "Master as Edge node",
    'master_instance_type': "Instance type of the Master Node",
    'node_instance_type': "Instance type of Worker Nodes",
    'node_count': "Number of worker nodes",
    'gluster_instance_type': "Instance type of GlusterFS nodes",
    'gluster_count': "Number of GlusterFS nodes",
    'gluster_extra_disk_size': "Disk size of the GlusterFS",
    'pvc_size': "Disk size of your CRE",
    'phenomenal_version': "PhenoMeNal Version",
  };

  // Auxiliary data
  phenVersions = [];
  shared_instance_type;
  regions = [];
  flavorTypes = [];
  externalNetworks = [];
  floatingIpPools = [];


  constructor(private _formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef,
              private cloudProviderMetadataService: CloudProviderMetadataService) {
    this.phenVersions = [
      {value: 'latest', displayValue: 'Cerebellin'}
    ];
  }

  ngOnInit() {
    this.buildForm();
    this.showNetworkSettings = this.cloudProvider.name === "ostack";


    this.cloudProviderMetadataService.getRegions(this.cloudProvider).subscribe(
      (data) => {
        // console.log("Flavors****", data);
        console.log("Trying to set REGIONS!!!");
        this.regions.splice(0, this.flavorTypes.length);
        this.regions = this.formatRegions(data);
      },
      (error) => {
        console.error(error);
      }
    );


    this.cloudProviderMetadataService.getFlavors(this.cloudProvider).subscribe(
      (data) => {
        // console.log("Flavors****", data);
        console.log("Trying to set FLAVORS!!!");
        this.flavorTypes.splice(0, this.flavorTypes.length);
        this.flavorTypes = this.formatFlavors(data);
      },
      (error) => {
        console.error(error);
      }
    );


    if (this.cloudProvider.name === 'ostack') {
      this.cloudProviderMetadataService.getExternalNetworks(this.cloudProvider).subscribe(
        (data) => {
          // console.log("Flavors****", data);
          console.log("Trying to set Networks!!!");
          this.externalNetworks.splice(0, this.flavorTypes.length);
          this.externalNetworks = this.formatExternalNetworks(data);
        },
        (error) => {
          console.error(error);
        }
      );
      this.cloudProviderMetadataService.getFloatingIpPools(this.cloudProvider).subscribe(
        (data) => {
          // console.log("Flavors****", data);
          console.log("Trying to set FloatingIpPools !!!");
          this.floatingIpPools.splice(0, this.flavorTypes.length);
          this.floatingIpPools = this.formatFloatingIpPools(data);
        },
        (error) => {
          console.error(error);
        }
      );
      this.showNetworkSettings = true;
      this.showRegions = false;
    }
  }


  onChangeSharedInstanceType() {
    console.log("Changed instance type", this.shared_instance_type);
    // propagate the change to the specific node types
    this.cloudProvider.credential.master_instance_type = this.shared_instance_type;
    this.cloudProvider.credential.node_instance_type = this.shared_instance_type;
    this.cloudProvider.credential.gluster_instance_type = this.shared_instance_type;
    this.ngAfterViewChecked();
  }

  onChangeExternalNetwork() {
    console.log("Changed external network", this.cloudProvider.credential.network);
    // set the external network name
    for (let n of this.externalNetworks) {
      if (n.id === this.cloudProvider.credential.network) {
        this.cloudProvider.credential.ip_pool = n.label;
        break;
      }
    }
    console.log("Update deployment parameters", this.cloudProvider.credential);
    this.ngAfterViewChecked();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  buildForm(): void {
    let configControls = {};
    for (let f of Object.keys(this.formFields)) {
      if(this.cloudProvider.name === 'ostack' && f === "region") continue;
      configControls[f] = new FormControl(this.cloudProvider.credential[f], [Validators.required]);
    }
    this.formControls = configControls;
    this.formAdvancedSettings = this._formBuilder.group(configControls);
    this.formAdvancedSettings.valueChanges.subscribe(data => this.onValueChanged(data));

    this.shared_instance_type = this.cloudProvider.credential["master_instance_type"]
      ? this.cloudProvider.credential["master_instance_type"] : this.cloudProvider.credential["master_flavor"];
    this.sharedInstanceFormControl = new FormControl(this.shared_instance_type, [Validators.required]);
    this.simplifiedForm = this._formBuilder.group({
      'shared_instance_type': this.sharedInstanceFormControl
    });

    this.externalNetworkControl = new FormControl(
      this.externalNetworks.length > 0 ? this.externalNetworks[0].id : "", [Validators.required]);
    this.ipPoolControl = new FormControl(
      this.floatingIpPools.length > 0 ? this.floatingIpPools[0].id : "", [Validators.required]);
    this.networkForm = this._formBuilder.group({
      'external_network': this.externalNetworkControl,
      'floating_ip': this.ipPoolControl
    });

    this.onValueChanged();
  }

  get form(): FormGroup {
    return this.showAdvancedSettings ? this.formAdvancedSettings : this.simplifiedForm;
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;
    if (!this.showAdvancedSettings) {
      this.validateControl(this.simplifiedForm, 'shared_instance_type', this.sharedInstanceFormControl)
    } else {
      for (const field of Object.keys(this.formFields)) {
        const control = form.get(field);
        this.validateControl(this.formAdvancedSettings, field, control);
      }
    }
  }

  private validateControl(form, field, control) {
    // clear previous error message (if any)
    this.formErrors[field] = '';
    if (control && control.dirty && !control.valid) {
      this.formErrors[field] += field + " is required.";
      console.error(this.formErrors[field]);
      for (const key of Object.keys(control.errors)) {
        this.formErrors[field] += control.errors[key];
        console.error(control.errors[key]);
      }
    }
  }


  public updateAdvancedSettingsSelection(change: MatButtonToggleChange) {
    console.log("change", change, this.showAdvancedSettings);
    this.showAdvancedSettings = change.source.checked;
  }

  public onSubmit() {

  }

  public onKeyPressed(event) {
    if (event.keyCode == 13) {
      if (this.form.valid)
        this.onSubmit();
      return false;
    }
  }

  private formatRegions(regions) {
    let result = [];
    for (let i of regions) {
      if (this.cloudProvider.name === "aws") {
        result.push({
          displayValue: i.displayValue,
          value: i.value
        });
      } else if (this.cloudProvider.name === "ostack") {
        result.push({
          displayValue: i.displayValue,
          value: i.value
        });
      } else if (this.cloudProvider.name === "gcp") {
        result.push({
          displayValue: i.displayValue,
          value: i.value
        });
      }
    }
    return result;
  }


  private formatFlavors(flavors) {
    let result = [];
    for (let i of flavors) {
      if (this.cloudProvider.name === "aws") {
        result.push({
          displayValue: i.Type + " -- " + [i.Name, i.vCPUs, i.Memory, i.Instance_Storage, i.Arch].join(", "),
          value: i.Type
        });
      } else if (this.cloudProvider.name === "ostack") {
        result.push({
          displayValue: i.name,
          value: i.name
        });
      } else if (this.cloudProvider.name === "gcp") {
        result.push({
          displayValue: i.name + " -- " + i.description,
          value: i.name
        });
      }
    }
    return result;
  }

  private formatExternalNetworks(networks) {
    let result = [];
    for (let i of networks) {
      if (this.cloudProvider.name === "ostack") {
        result.push({
          displayValue: i.label,
          value: i.id
        });
      }
    }
    return result;
  }

  private formatFloatingIpPools(ipPools) {
    let result = [];
    for (let i of ipPools) {
      if (this.cloudProvider.name === "ostack") {
        result.push({
          displayValue: i.name,
          value: i.name
        });
      }
    }
    return result;
  }
}
