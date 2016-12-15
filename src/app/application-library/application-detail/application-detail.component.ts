import {Component, OnInit, ViewChild, AfterViewChecked} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
// import {Observable} from 'rxjs/Observable';
// import {Application} from '../../shared/model/application/application';
import {ApplicationsDatabaseService} from '../../shared/service/applications-database/applications-database.service';
import {BreadcrumbService} from '../../shared/component/breadcrumb/breadcrumb.service';
import {ApplicationLibraryService} from '../../shared/service/application-library/application-library.service';

@Component({
  selector: 'ph-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.css'],
  providers: [ApplicationsDatabaseService]
})

export class ApplicationDetailComponent implements OnInit, AfterViewChecked {

  id: string;
  // applications$: Observable<Application[]>;
  @ViewChild('app') app;
  // public isLoading = false;
  dockerApp;

  constructor(
    // private service: ApplicationsDatabaseService,
              private appLibraryService: ApplicationLibraryService,
              private activatedRoute: ActivatedRoute,
              private breadcrumbService: BreadcrumbService,
              // private renderer: Renderer
  ) {
    this.id = activatedRoute.snapshot.params['id'];

    breadcrumbService.addFriendlyNameForRoute('/app-library/' + this.id, ' '); // Initialise as empty string

  }

  ngOnInit() {

    // this.applications$ = this.service.applications$;
    // this.isLoading = true;
    //
    // this.service.load(this.id, () => {
    //   this.isLoading = false;
    // });

    this.getApp(this.id);

  }

  ngAfterViewChecked() {
    if (this.app !== undefined) {
      let app_name = this.app.nativeElement.innerText;
      this.breadcrumbService.addFriendlyNameForRoute('/app-library/' + this.id, app_name);
    }
  }

  getApp(appName: string) {
    this.appLibraryService.loadApp(this.id)
      .subscribe(
        data => {
          this.dockerApp = data;
        }
      );
  }

  concatenate(array) {

    let text = '';

    if (array.length === 1) {
      text = array[0];
    } else {
      for (let i = 0; i < array.length; i++) {

        if (array.length - 1 === i) {
          text += 'and ' + array[i];
          break;
        }
        text += array[i];
        text += ', ';
      }
    }

    return text;
  }

}
