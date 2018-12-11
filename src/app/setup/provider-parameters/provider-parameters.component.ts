import { CloudProvider } from "../../shared/service/deployer/cloud-provider";
import { ErrorStateMatcher, MatButtonToggleChange } from "@angular/material";
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from "@angular/forms";
import { CloudProviderMetadataService } from "../../shared/service/cloud-provider-metadata/cloud-provider-metadata.service";
import { AppConfig } from "../../app.config";

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
export class ProviderParametersComponent implements OnInit, OnChanges {
  @Input() cloudProvider: CloudProvider;
  @Output() cloudProviderChange: EventEmitter<CloudProvider> = new EventEmitter<CloudProvider>();

  // tooltip configuration
  toolTipShowDelay = 800;
  toolTipHideDelay = 1000;
  toolTipPosition = "left";


  // Network Form Settings
  networkForm: FormGroup;
  externalNetworkControl: FormControl;
  ipPoolControl: FormControl;
  privateNetworkControl: FormControl;
  showNetworkSettings: boolean = false;

  /* const */ noFloatingIpSetting = { id: "", displayValue: "Don't use floating IPs", value: ""};
  /* const */ newPrivateNetSetting = { id: "", displayValue: "Create ad hoc network", value: ""};

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
    'edgenode_instance_type': "Instance type of Edge Nodes",
    'edgenode_count': "Number of the Edge nodes",
    'glusternode_instance_type': "Instance type of GlusterFS nodes",
    'glusternode_count': "Number of GlusterFS nodes",
    'glusternode_extra_disk_size': "Disk size of the GlusterFS",
    'phenomenal_pvc_size': "Disk size of your CRE",
    'phenomenal_version': "PhenoMeNal Version",
  };

  // Auxiliary data
  phenVersions = [];
  shared_instance_type;
  regions = [];
  flavorTypes = [];
  externalNetworks = [];
  privateNetworks = [];
  floatingIpPools = [];

  // Auxiliary state info
  private previousCloudProvider = null;
  private serviceSubscriptions = [];

  constructor(private _formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef,
              private appConfig: AppConfig,
              private cloudProviderMetadataService: CloudProviderMetadataService) {
    this.phenVersions = [
      {
         id: "2.0-Cerebellin-20181206",
         name: 'v2018.02 Cerebellin',
         url: "https://github.com/phnmnl/cloud-deploy-kubenow-cerebellin-20181206"
      },
      {
        id: "3.0-Dalcotidine-20181206",
        name: 'v2018.08 Dalcotidine',
        url: "https://github.com/phnmnl/cloud-deploy-kubenow-dalcotidine-20181206"
      },
    ];
  }

  ngOnInit() {
    this.buildForm();
    this.updateSubscriptions();
  }

  ngOnChanges() {
    console.debug("Updated provider", this.previousCloudProvider, this.cloudProvider);
    if (this.previousCloudProvider != this.cloudProvider) {
      this.previousCloudProvider = this.cloudProvider;
      this.updateSubscriptions();
    }
  }

  private updateSubscriptions() {
    // clean old subscriptions
    for (let s of this.serviceSubscriptions)
      s.unsubscribe();
    this.serviceSubscriptions.splice(0, this.serviceSubscriptions.length);

    // set the latest PhenoMeNal version as default
    this.cloudProvider.parameters.phenomenal_version = this.phenVersions[this.phenVersions.length - 1];

    // update settings and subscriptions

    this.serviceSubscriptions.push(
      this.cloudProviderMetadataService.getRegions(this.cloudProvider).subscribe(
        (data) => {
          console.debug("Setting REGIONS");
          this.regions = this.formatRegions(data);
          if (this.regions.length > 0) {
            this.cloudProvider.parameters.default_region = this.regions[0].value;
            console.debug("Setting default region to %O", this.cloudProvider.parameters.default_region);
          }
        },
        (error) => {
          console.error(error);
        }
      )
    );

    this.serviceSubscriptions.push(
      this.cloudProviderMetadataService.getFlavors(this.cloudProvider).subscribe(
        (data) => {
          console.debug("Setting FLAVOUR list and defaults");
          this.flavorTypes = this.formatFlavors(data);
          this.shared_instance_type = this.cloudProvider.parameters.master_instance_type;
          // Preset the edge instance type so that validation passes, even when the user sets
          // "master as edge" and doesn't explicitly set a value for this field.
          // The field value is ignored by kubenow if master-as-edge is set
          if (this.flavorTypes.length > 0) {
            this.cloudProvider.parameters.edgenode_instance_type = this.flavorTypes[0].value;
            // LP: I thought this link between form control and model was established by the definition
            // of the element field in the html, but it isn't.  Without the following line the form
            // remains invalid until the user unchecks "master as edge".
            this.formAdvancedSettings.controls['edgenode_instance_type'].setValue(this.cloudProvider.parameters.edgenode_instance_type);
          }
        },
        (error) => {
          console.error(error);
        }
      )
    );

    if (this.cloudProvider.name === 'ostack') {
      this.serviceSubscriptions.push(
        this.cloudProviderMetadataService.getNetworks(this.cloudProvider).subscribe(
          (data) => {
            console.debug("Setting networks");
            //console.debug("provider returned these networks: %O", data);
            this.externalNetworks = this.formatExternalNetworks(data);
            this.privateNetworks = this.formatPrivateNetworks(data);
            //console.debug("formatted externalNetworks: %O", this.externalNetworks);
            //console.debug("formatted privateNetworks: %O", this.privateNetworks);
          },
          (error) => {
            console.error(error);
          }
        )
      );
      this.serviceSubscriptions.push(
        this.cloudProviderMetadataService.getFloatingIpPools(this.cloudProvider).subscribe(
          (data) => {
            console.debug("Setting FloatingIpPools");
            //console.debug("provider returned these floating IP pools: %O", data);
            this.floatingIpPools = this.formatFloatingIpPools(data);
            //console.debug("formatted ip pool list: %O", this.floatingIpPools);
          },
          (error) => {
            console.error(error);
          }
        )
      );
      this.showNetworkSettings = true;
      this.showRegions = false;
    }
  }

  onChangeSharedInstanceType() {
    console.log("Changed instance type", this.shared_instance_type);
    // propagate the change to the specific node types
    this.cloudProvider.parameters.master_instance_type = this.shared_instance_type;
    this.cloudProvider.parameters.edgenode_instance_type = this.shared_instance_type;
    this.cloudProvider.parameters.node_instance_type = this.shared_instance_type;
    this.cloudProvider.parameters.glusternode_instance_type = this.shared_instance_type;
    this.ngAfterViewChecked();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  buildForm(): void {
    let configControls = {};
    for (let f of Object.keys(this.formFields)) {
      if (this.cloudProvider.name === 'ostack' && f === "region") continue;
      configControls[f] = new FormControl(this.cloudProvider.parameters[f], [Validators.required]);
    }
    this.formControls = configControls;
    this.formAdvancedSettings = this._formBuilder.group(configControls);
    this.formAdvancedSettings.valueChanges.subscribe(data => this.onValueChanged(data));

    if (this.cloudProvider.parameters["master_instance_type"])
      this.shared_instance_type = this.cloudProvider.parameters["master_instance_type"];
    else
      this.shared_instance_type = this.cloudProvider.parameters["master_flavor"];
    this.sharedInstanceFormControl = new FormControl(this.shared_instance_type, [Validators.required]);

    this.simplifiedForm = this._formBuilder.group({
      'shared_instance_type': this.sharedInstanceFormControl
    });

    // select defaults
    this.externalNetworkControl = new FormControl(
      this.externalNetworks.length > 0 ? this.externalNetworks[0].value : "", [Validators.required]);
    this.ipPoolControl = new FormControl(
      this.floatingIpPools.length > 0 ? this.floatingIpPools[0].value : "", [Validators.required]);
    this.privateNetworkControl = new FormControl(
      this.privateNetworks.length > 0 ? this.privateNetworks[0].value : "", [Validators.required]);

    this.networkForm = this._formBuilder.group({
      'external_network': this.externalNetworkControl,
      'floating_ip': this.ipPoolControl,
      'private_network': this.privateNetworkControl
    });

    this.externalNetworkControl.setValue(this.cloudProvider.parameters.network);
    this.ipPoolControl.setValue(this.cloudProvider.parameters.ip_pool);
    // Map the private network id to its name for our cloud parameters.
    this.privateNetworkControl.valueChanges.subscribe(
      (value) => {
        for (let net of this.privateNetworks) {
          if (net.value === value) {
            this.cloudProvider.parameters.private_network_name = net.name;
            console.debug("Mapped private network %O to %O", value, net.name);
            break;
          }
        }
      });

    this.onValueChanged();
  }

  get form(): FormGroup {
    return this.showAdvancedSettings ? this.formAdvancedSettings : this.simplifiedForm;
  }

  onValueChanged(data?: any) {
    //console.log("[DEBUG] onValueChanged.  Here are the current network parameters");
    //console.log("cloudProvider network: %O", this.cloudProvider.parameters.network);
    //console.log("cloudProvider ip pool: %O", this.cloudProvider.parameters.ip_pool);
    //console.log("cloudProvider private network name: %O", this.cloudProvider.parameters.private_network_name);

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
    console.debug("change", change, this.showAdvancedSettings);
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
    let result = regions.map( (r) => { return { displayValue: r.displayValue, value: r.value }; } );
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


  /* external_first === "true" -> external networks first
   * external_first === "false" -> external networks last
   */
  private static cmpNetworks(external_first, n1, n2) {
    if (n1.external === n2.external)
      return n1.name.localeCompare(n2.name);
    else if (n1.external === external_first)
      return -1;
    else
      return 1;
  }

  private static cmpNetworksExternalFirst(n1, n2) {
    return ProviderParametersComponent.cmpNetworks(true, n1, n2);
  }

  private static cmpNetworksExternalLast(n1, n2) {
    return ProviderParametersComponent.cmpNetworks(false, n1, n2);
  }

  private static networkObjToListItem(obj) {
    let label = obj.name;
    if (obj.external)
      label += " (external)";
    return {
      displayValue: label,
      value: obj.id,
      name: obj.name
    };
  }

  private static formatNetworks(networks, externalFirst) {
    let result = [];
    let sortedNetworks = null;

    if (externalFirst)
      sortedNetworks = networks.sort( (a, b) => ProviderParametersComponent.cmpNetworksExternalFirst(a, b) );
    else
      sortedNetworks = networks.sort( (a, b) => ProviderParametersComponent.cmpNetworksExternalLast(a, b) );

    for (let i of sortedNetworks) {
      result.push(ProviderParametersComponent.networkObjToListItem(i));
    }
    return result;
  }

  private formatExternalNetworks(networks) {
    return ProviderParametersComponent.formatNetworks(networks, true);
  }

  private formatPrivateNetworks(networks) {
    return [ this.newPrivateNetSetting ].concat(ProviderParametersComponent.formatNetworks(networks, false));
  }

  private formatFloatingIpPools(ipPools) {
    let result = [];
    if (this.cloudProvider.name === "ostack") {
      result.push(this.noFloatingIpSetting);
      for (let i of ipPools) {
        result.push({
          displayValue: i.name,
          value: i.name
        });
      }
    }
    return result;
  }
}
