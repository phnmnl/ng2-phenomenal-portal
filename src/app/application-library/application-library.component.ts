import { Component, OnInit } from '@angular/core';
import { ApplicationLibraryService } from '../shared/service/application-library/application-library.service';
import { Node } from '../shared/component/tree/node/node';
import { AppLibraryCategories } from "../shared/service/application-library/categories";

@Component({
  selector: 'ph-application-library',
  templateUrl: './application-library.component.html',
  styleUrls: ['./application-library.component.css'],

})

/**
 * Application library page
 */
export class ApplicationLibraryComponent implements OnInit {

  apps;
  appSize;
  content: string;
  isList = false;
  previousQuery: string;
  functionality: Node[];
  approaches: Node[];
  instrument: Node[];
  private readonly appLibFilterKey = "AppLibraryFilter";

  constructor(private appLibraryService: ApplicationLibraryService) {
  }

  ngOnInit() {
    let categories: AppLibraryCategories = this.appLibraryService.getCategories();
    this.functionality = categories.functionality;
    this.approaches = categories.approaches;
    this.instrument = categories.instrument;

    if (this.isAppListFiltered()) {
      this.getAppsByFilter();
    } else {
      this.getAllApp();
    }
  }


  private setAppListFilter(value: boolean) {
    localStorage.setItem(this.appLibFilterKey, value ? "1" : "0");
  }

  private isAppListFiltered(): boolean {
    return localStorage.getItem(this.appLibFilterKey) === "1";
  }

  triggerList() {
    this.isList = !this.isList;
  }

  getAllApp() {
    this.appLibraryService.loadAllApp()
      .subscribe(
        data => {
          this.apps = data;
          this.appSize = data.length;
          this.setAppListFilter(false);
        }
      );
    this.previousQuery = 'functionality=&approaches=&instrument=';
  }

  getAppsByFilter() {
    // get filters
    const filter1 = this.traverseTree(this.functionality);
    const filter2 = this.traverseTree(this.approaches);
    const filter3 = this.traverseTree(this.instrument);
    // build query
    let query = 'functionality=' + ApplicationLibraryComponent.transformFilter(filter1)
      + '&approaches=' + ApplicationLibraryComponent.transformFilter(filter2)
      + '&instrument=' + ApplicationLibraryComponent.transformFilter(filter3);
    // perform query
    if (query !== this.previousQuery) {
      this.appLibraryService.loadSomeApp(query)
        .subscribe(
          data => {
            this.apps = data;
            this.setAppListFilter(true);
          }
        );
    }

    this.previousQuery = query;
  }


  private traverseTree(tree: Node[]) {

    const filter: string[] = [];
    const temp: string[] = [];

    for (const node of tree) {
      if (node.isCheck === true) {
        switch (node.name) {
          case '¹³C':
            temp.push('13C');
            break;
          case '2D ¹H ¹³C-HSQC NMR':
            temp.push('2D_1H_13C-HSQC_NMR');
            break;
          case '¹H NMR':
            temp.push('1H_NMR');
            break;
          default:
            temp.push(node.name);
        }
      }

      if (node.children.length > 0) {
        filter.push.apply(filter, this.traverseTree(node.children));
      }
    }

    filter.push.apply(filter, temp);
    return filter;
  }

  private static transformFilter(filter: string[]) {
    let text = '';
    const plus = '+';
    for (let f of filter) {
      f = f.replace(/ /g, '_');
      f = f.toUpperCase();
      text += f;
      text += plus;
    }
    return text;
  }
}
