import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from '../cloud-provider';

@Component({
  selector: 'ph-cloud-setup',
  templateUrl: './cloud-setup.component.html',
  styleUrls: ['./cloud-setup.component.scss']
})

export class CloudSetupComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;

  }

  ngOnInit() {
  }

  get galaxy_instance_url(): string {
    console.debug("Galaxy instance URL:", this.config.getConfig("galaxy_url"));
    return this.config.getConfig("galaxy_url") + "/user/login";
  }
}
