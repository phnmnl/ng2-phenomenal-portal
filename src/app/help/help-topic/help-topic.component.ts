import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '../../shared/component/breadcrumb/breadcrumb.service';
import { WikiService } from '../../shared/service/wiki/wiki.service';

@Component({
  selector: 'fl-help-topic',
  templateUrl: 'help-topic.component.html',
  styleUrls: ['help-topic.component.css'],
})

export class HelpTopicComponent implements OnInit {

  id: string;
  helpContent = ``;

  constructor(
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private wikiService: WikiService
  ) {
    this.id = activatedRoute.snapshot.params['id'];
    breadcrumbService.addFriendlyNameForRoute('/help/' + this.id, ' '); // Initialise as empty string
    this.getPage();
  }

  ngOnInit() {
  }

  getPage() {
    this.wikiService.loadPage(this.id)
      .subscribe(
        data => {
          this.helpContent = this.process(data);
        }
      );
  }

  /**
   * This function tries to modify the URL of local html links for making it displaying properly in the app.
   * @param data
   * @returns {string|void}
   */
  process(data) {
    data = data.replace(/(href=")([^http])/g, 'href="help/$2');
    data = data.replace(/(src=")([^http])/g, 'src="http://phenomenal-h2020.eu/wiki/wiki-markdown/phenomenal-h2020.wiki/$2');
    return data;
  }

}
