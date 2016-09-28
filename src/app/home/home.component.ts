import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
  selector: 'fl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  @ViewChild('childModal') public childModal: ModalDirective;

  // The time to show the next photo
  private NextPhotoInterval: number = 5000;
  // Looping or not
  private noLoopSlides: boolean = false;

  private noSlideControl: boolean = false;
  // Photos
  private slides: Array<any> = [];

  private img1 = "assets/img/home/img1.png";
  private img2 = "assets/img/home/img2.png";
  private img3 = "assets/img/home/img3.png";

  constructor() {
    this.addNewSlide();
  }

  private addNewSlide() {
    this.slides.push(
        {
          image1: 'assets/img/logo/partner/EMBL-EBI.png', decription1: 'EMBL-EBI', website1: 'https://www.ebi.ac.uk/',
          image2: 'assets/img/logo/partner/Imperial-College-London.png', decription2: 'Imperial College London', website2: 'https://www.imperial.ac.uk/',
          image3: 'assets/img/logo/partner/Uppsala-University.png', decription3: 'Uppsala University', website3: 'http://www.uu.se/',
          image4: 'assets/img/logo/partner/IPB.png', decription4: 'IPB', website4: 'http://www.ipb-halle.de/'
        },
        {
          image1: 'assets/img/logo/partner/Netherlands-Metabolomics-Centre.png', decription1: 'Netherlands Metabolomics Centre', website1: 'http://www.metabolomicscentre.nl/',
          image2: 'assets/img/logo/partner/C.I.R.M.M.P.png', decription2: 'C.I.R.M.M.P', website2: 'http://www.cerm.unifi.it/cirmmp-sp-2001548042',
          image3: 'assets/img/logo/partner/University-of-Oxford.png', decription3: 'University of Oxford', website3: 'http://www.ox.ac.uk/',
          image4: 'assets/img/logo/partner/University-of-Barcelona.png', decription4: 'University of Barcelona', website4: 'http://www.ub.edu/'
        }
    );
  }

  private removeLastSlide() {
    this.slides.pop();
  }



  public showChildModal(): void {
    this.childModal.show();
  }

  public hideChildModal(): void {
    this.childModal.hide();
  }

}
