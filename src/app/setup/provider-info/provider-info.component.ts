import { Component, Input, OnInit } from '@angular/core';
import { CloudProvider } from "../../shared/service/deployer/cloud-provider";

@Component({
  selector: 'ph-provider-info',
  templateUrl: './provider-info.component.html',
  styleUrls: ['./provider-info.component.scss']
})
export class ProviderInfoComponent implements OnInit {

  @Input() cloudProvider: CloudProvider;

  constructor() { }

  ngOnInit() {
  }

}
