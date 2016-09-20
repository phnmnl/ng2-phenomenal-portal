import { Component } from '@angular/core';

@Component({
  selector: 'fl-cloud-research-environment',
  templateUrl: 'cloud-research-environment.component.html',
  styleUrls: ['cloud-research-environment.component.css'],
})
export class CloudResearchEnvironmentComponent {

  // The time to show the next photo
  private NextPhotoInterval: number = 8000;

  // Looping or not
  private noLoopSlides: boolean = false;

  // carousel indicator
  private noLoopIndicator: boolean = true;

  // Photos
  private slides: Array<any> = [];

  constructor() {
    this.addNewSlide();
  }

  private addNewSlide() {
    this.slides.push(
      {image: 'assets/img/cloud-research-environment/slider/img1.png', text: 'You follow our easy setup process and install the Cloud Research Environment (CRE) on the PhenoMeNal cloud or you can use your own cloud provider such as Amazon Cloud, Google Cloud etc..'},
      {image: 'assets/img/cloud-research-environment/slider/img2.png', text: 'You can access the CRE via the Galaxy workflow tool which provides a nice GUI to drag and drop any of the applications of the App Library into your analysis.'},
      {image: 'assets/img/cloud-research-environment/slider/img4.png', text: 'If you prefer working with code, you can invoke any of the applications in the App Library using our Jupiter IPython code web environment.'},
      {image: 'assets/img/cloud-research-environment/slider/img3.png', text: 'Browse the App Library through this portal to get a better understanding of what the applications offer and how people have used them.'}
    );
  }

  private removeLastSlide() {
    this.slides.pop();
  }

}
