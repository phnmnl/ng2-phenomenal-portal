import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from '../cloud-provider';
import { GalaxyService } from '../../shared/service/galaxy/galaxy.service';

@Component({
  selector: 'ph-cloud-setup',
  templateUrl: './cloud-setup.component.html',
  styleUrls: ['./cloud-setup.component.scss']
})

export class CloudSetupComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;

  constructor(public galaxyService: GalaxyService) {
  }

  ngOnInit() {
  }

  get galaxy_instance_url(): string {
    return this.galaxyService.galaxy_instance_url;
  }
}
