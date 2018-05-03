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

  content: string;
  public isList = false;
  apps;
  appSize;
  previousQuery: string;

  functionality: Node[];
  approaches: Node[];
  instrument: Node[];

  }

  ngOnInit() {
    let categories: AppLibraryCategories = this.appLibraryService.getCategories();
    this.functionality = categories.functionality;
    this.approaches = categories.approaches;
    this.instrument = categories.instrument;


    this.getAllApp();

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
        }
      );
    this.previousQuery = 'functionality=&approaches=&instrument=';
  }

  getAppsByFilter() {

    const filter1 = this.traverseTree(this.functionality);

    const filter2 = this.traverseTree(this.approaches);

    const filter3 = this.traverseTree(this.instrument);

    let query = 'functionality=' + this.transformFilter(filter1);

    query += '&approaches=' + this.transformFilter(filter2);

    query += '&instrument=' + this.transformFilter(filter3);

    if (query !== this.previousQuery) {
      this.appLibraryService.loadSomeApp(query)
        .subscribe(
          data => {
            this.apps = data;
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

  private transformFilter(filter: string[]) {

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
