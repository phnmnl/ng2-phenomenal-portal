import { Component, OnInit } from '@angular/core';
import {Faq} from './faq';

@Component({
  selector: 'ph-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  private faqSet: Faq[];

  constructor() { }

  ngOnInit() {
    this.faqSet = [
      {
        category: 'General',
        questionSet: [
          {
            question: 'How can I leave you feedback?',
            answer: '<p>Please use the <a href="http://phenomenal-h2020.eu/home/help/">help form</a> to give us feedback. ' +
            'User feedback in one of the most important ways for us to improve user satisfaction and ensure our offering is ' +
            'fit for purpose.</p>'
          },
          {
            question: 'What options do I have when I want to use the PhenoMeNal services?',
            answer: '<p>Depending on you preference you can choose a public or a private (local) installation of the PhenoMeNal ' +
            'services. Currently we support both Google Cloud and Amazon Web Services to deploy to. Please visit the ' +
            '<a href="http://portal.phenomenal-h2020.eu/home">portal</a> to deploy to one of the public providers. Local ' +
            'installation can be done to OpenStack or for testing purposes you can use a MiniKube installation. More about ' +
            'local installation can be found on our <a href="https://github.com/phnmnl/phenomenal-h2020/wiki">developers wiki</a>.</p>'
          },
          {
            question: 'How can I run my own tools on the PhenoMeNal infrastructure?',
            answer: '<p>There are two ways to do that. You can either follow the instructions on our ' +
            '<a href="https://github.com/phnmnl/phenomenal-h2020/wiki/How-to-make-your-software-tool-available-through-PhenoMeNal">' +
            'wiki on how to make your software available through PhenoMeNal</a> or do a manual deployment of the infrastructure ' +
            'and add the tools directly. More information on how to manually deploy PhenoMeNal can be found also on our wiki ' +
            'at: <a href="https://github.com/phnmnl/phenomenal-h2020/wiki/QuickStart-Installation-for-Local-PhenoMeNal-Workflow">' +
            'QuickStart Installation for Local PhenoMeNal Workflow</a>. This also explains the preferred way to test your ' +
            'software locally before making it available through PhenoMeNal.</p>'
          },
          {
            question: 'What does it cost?',
            answer: '<p>All software is available free of charge on <a href="https://github.com/phnmnl">GitHub</a>. Depending' +
            ' on how and where you deploy our services you may be required to pay for hosting and/or data storage/transfer. ' +
            'As soon as our first release is made public we will provide and example (best effort) overview of the cost for ' +
            'running the PhenoMeNal services on Google Cloud or Amazon Web Services.</p>'
          },
        ]
      }
    ];
  }

}
