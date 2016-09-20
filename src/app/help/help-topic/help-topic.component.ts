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
  // @ViewChild('app') app;

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
          // console.log(this.helpContent);
        }
      );
  }

  /**
   * This function tries to modify the URL of local html links for making it displaying properly in the app.
   * @param data
   * @returns {string|void}
   */
  process(data) {
    return data.replace(/(href=")([^http])/g, 'href="help/$2');
  }

  // ngAfterViewChecked() {
  //   if (this.app !== undefined) {
  //     let app_name = this.app.nativeElement.innerText;
  //     this.breadcrumbService.addFriendlyNameForRoute('/help/' + this.id, app_name);
  //   }
  // }
}
