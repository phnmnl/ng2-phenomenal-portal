import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from "../../app.config";

@Component({
  selector: 'ph-home',
  templateUrl: 'home.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['home.component.css']
})
export class HomeComponent {

  // The time to show the next photo
  private _NextPhotoInterval = 5000;

  // Looping or not
  private _noLoopSlides = false;
  private _img1 = 'assets/img/home/img1.png';
  private _img2 = 'assets/img/home/img2.png';
  private _img3 = 'assets/img/home/img3.png';
  private _img3_title = 'Galaxy Workflow';
  public galaxy_logo = 'assets/img/logo/galaxy_with_txt.png';
  public jupyter_logo = 'assets/img/logo/jupyter_with_txt.png';
  public providers_logo = 'assets/img/logo/providers_logo.png';
  public public_galaxy_instance_url;

  constructor(private config: AppConfig) {
    this.addNewSlide();
    this.public_galaxy_instance_url = this.config.getConfig('galaxy_url');
  }

  get img3_title(): string {
    return this._img3_title;
  }

  get NextPhotoInterval(): number {
    return this._NextPhotoInterval;
  }

  get noLoopSlides(): boolean {
    return this._noLoopSlides;
  }

  get noSlideControl(): boolean {
    return this._noSlideControl;
  }

  private _noSlideControl = false;
  // Photos
  slides: Array<any> = [];

  get img1(): string {
    return this._img1;
  }

  get img2(): string {
    return this._img2;
  }

  get img3(): string {
    return this._img3;
  }


  private addNewSlide() {
    this.slides.push(
      {
        image1: 'assets/img/logo/partner/EMBL-EBI.png',
        description1: 'EMBL-EBI',
        website1: 'https://www.ebi.ac.uk/',
        image2: 'assets/img/logo/partner/Imperial-College-London.png',
        description2: 'Imperial College London',
        website2: 'https://www.imperial.ac.uk/',
        image3: 'assets/img/logo/partner/Uppsala-University.png',
        description3: 'Uppsala University',
        website3: 'http://www.uu.se/',
        image4: 'assets/img/logo/partner/IPB.png',
        description4: 'IPB',
        website4: 'http://www.ipb-halle.de/'
      },
      {
        image1: 'assets/img/logo/partner/Netherlands-Metabolomics-Centre.png',
        description1: 'Netherlands Metabolomics Centre',
        website1: 'http://www.metabolomicscentre.nl/',
        image2: 'assets/img/logo/partner/C.I.R.M.M.P.png',
        description2: 'C.I.R.M.M.P',
        website2: 'http://www.cerm.unifi.it/cirmmp-sp-2001548042',
        image3: 'assets/img/logo/partner/University-of-Oxford.png',
        description3: 'University of Oxford',
        website3: 'http://www.ox.ac.uk/',
        image4: 'assets/img/logo/partner/University-of-Barcelona.png',
        description4: 'University of Barcelona',
        website4: 'http://www.ub.edu/'
      }
    );
  }
}
