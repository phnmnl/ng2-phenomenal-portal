import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {WikiService} from '../shared/service/wiki/wiki.service';
import {Router} from '@angular/router';
import 'rxjs/Rx';

@Component({
  selector: 'fl-help',
  templateUrl: 'help.component.html',
  styleUrls: ['help.component.css'],
  providers: [WikiService]
})
export class HelpComponent implements OnInit {

  userDocumentationItems: string[];
  developerDocumentationItems: string[];
  tutorialsItems: string[];
  selected = 0;
  itemsSize = 0;
  mouseover: boolean = false;
  itemArray = [];

  private searchTermStream = new Subject<string>();
  items: Observable<string[]> = this.searchTermStream
    .debounceTime(300)
    .distinctUntilChanged()
    .switchMap((term: string) => this.wikiService.search(term));


  constructor(private router: Router,
              private wikiService: WikiService) {
  }

  ngOnInit() {
    this.getUserDocumentationMenu();
    this.getDeveloperDocumentationMenu();
    this.getTutorialsMenu();
  }

  getUserDocumentationMenu() {
    this.wikiService.loadUserDocumentationMenu()
      .subscribe(
        data => {
          this.userDocumentationItems = data;
        }
      );
  }

  getDeveloperDocumentationMenu() {
    this.wikiService.loadDeveloperDocumentationMenu()
      .subscribe(
        data => {
          this.developerDocumentationItems = data;
        }
      );
  }

  getTutorialsMenu() {
    this.wikiService.loadTutorialsMenu()
      .subscribe(
        data => {
          this.tutorialsItems = data;
        }
      );
  }

  search(term: string) {
    this.searchTermStream.next(term);
    this.items.subscribe(res => {
      this.itemsSize = res.length;
      this.itemArray = res;
    });
  }

  onKey($event) {
    if (this.itemsSize === 0) {
      this.selected = 0;
    }
    if (this.selected < 0) {
      this.selected = 0;
    }
    if ($event.key === 'ArrowDown') {
      this.selected = this.selected + 1;
      if (this.selected >= this.itemsSize && this.itemsSize !== 0) {
        this.selected = this.itemsSize - 1;
      }
    }
    if ($event.key === 'ArrowUp') {
      this.selected = this.selected - 1;
    }

  }

  onEnterKey($event, page, linka) {

    if ($event.key === 'Enter') {
      let link = this.itemArray[this.selected].link;
      this.router.navigateByUrl(page + '/' + link);
    }
  }
}
