import { Component } from '@angular/core';
import { TokenService } from 'ng2-cloud-portal-service-lib';
import { AppConfig } from "../../app.config";

@Component({
  selector: 'ph-cloud-research-environment',
  templateUrl: './cloud-research-environment.component.html',
  styleUrls: ['./cloud-research-environment.component.css'],
})
export class CloudResearchEnvironmentComponent {
  private _noLoopSlides = false;

  // carousel indicator
  private _noLoopIndicator = true;
  // link to the public galaxy instance
  public public_galaxy_instance_url;
  // Photos
  private slides: Array<any> = [];
  // img
  private _img2 = 'assets/img/cloud-research-environment/img2.png';
  private _img3 = 'assets/img/cloud-research-environment/img3.png';

  constructor(private config: AppConfig) {
    this.addNewSlide();
    this.public_galaxy_instance_url = this.config.getConfig('galaxy_url');
  }

  get img2(): string {
    return this._img2;
  }

  get img3(): string {
    return this._img3;
  }

  // The time to show the next photo
  private _NextPhotoInterval = 8000;

  // Looping or not
  get NextPhotoInterval(): number {
    return this._NextPhotoInterval;
  }

  get noLoopSlides(): boolean {
    return this._noLoopSlides;
  }

  get noLoopIndicator(): boolean {
    return this._noLoopIndicator;
  }


  private addNewSlide() {
    this.slides.push(
      {
        image: 'assets/img/cloud-research-environment/slider/img1.png',
        text: 'You follow our easy setup process and install the Cloud Research Environment (CRE) on the PhenoMeNal cloud ' +
        'or you can use your own cloud provider such as Amazon Cloud, Google Cloud etc..'
      },
      {
        image: 'assets/img/cloud-research-environment/slider/img2.png',
        text: 'You can access the CRE via the Galaxy workflow tool which provides a nice GUI to drag and drop any of ' +
        'the applications of the App Library into your analysis.'
      },
      {
        image: 'assets/img/cloud-research-environment/slider/img4.png',
        text: 'If you prefer working with code, you can invoke any of the applications in the App Library using our Jupiter IPython ' +
        'code web environment.'
      },
      {
        image: 'assets/img/cloud-research-environment/slider/img3.png',
        text: 'Browse the App Library through this portal to get a better understanding of what the applications offer ' +
        'and how people have used them.'
      }
    );
  }

  // getAllApplication() {
  //   this._applicationService.getAll(
  //     this.credentialService.getUsername(),
  //     this.tokenService.getToken()
  //   ).subscribe(
  //     deployment => {
  //       console.log('[RepositoryComponent] getAll %O', deployment);
  //     },
  //     error => {
  //       console.log('[RepositoryComponent] getAll error %O', error);
  //       this.errorService.setCurrentError(error);
  //       this.tokenService.clearToken();
  //       this.credentialService.clearCredentials();
  //     }
  //   );
  // }

}
