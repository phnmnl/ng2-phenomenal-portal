import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {Application} from "../shared/model/application/application";
import {ApplicationsDatabaseService} from "../shared/service/applications-database/applications-database.service";
import {ApplicationLibraryService} from "../shared/service/application-library/application-library.service";

@Component({
  selector: 'fl-application-library',
  templateUrl: 'application-library.component.html',
  styleUrls: ['application-library.component.css'],
})
export class ApplicationLibraryComponent implements OnInit {

  applications$: Observable<Application[]>;
  public isLoading = false;
  content: string;
  public isList = false;
  apps;

  DAD = false;
  DIMS = false;
  GCMS = false;
  LCMS = false;
  NMR = false;
  RAMAN = false;
  annotation = false;
  // normalisation = false;
  processing = false;
  statistics = false;

  constructor(
    private service: ApplicationsDatabaseService,
    private appLibraryService: ApplicationLibraryService
  ) {

  }

  ngOnInit() {

    this.applications$ = this.service.applications$;
    this.isLoading = true;

    this.service.loadAll( () => {
      this.isLoading = false;
    });

    this.getAllApp();

  }

  triigerList() {
    this.isList = !this.isList;
  }

  getAllApp() {
    this.appLibraryService.loadAllApp()
      .subscribe(
        data => {
          this.apps = data;
        }
      );
  }

  getAppByCheckBox(){

    let text = "";
    if(this.DAD) {
      text += "DAD";
      text += "+";
    }

    if(this.DIMS) {
      text = "DIMS";
      text += "+";
    }
    if(this.GCMS) {
      text += "GC-MS";
      text += "+";
    }

    if(this.LCMS) {
      text = "LC-MS";
      text += "+";
    }
    if(this.NMR) {
      text += "NMR";
      text += "+";
    }

    if(this.RAMAN) {
      text = "RAMAN";
      text += "+";
    }

    if(this.annotation) {
      text = "Annotation";
      text += "+";
    }

    // if(this.normalisation) {
    //   text = "Normalisation";
    //   text += "+";
    // }

    if(this.processing) {
      text = "Processing";
      text += "+";
    }

    if(this.statistics) {
      text = "Statistical Analysis";
      text += "+";
    }

    this.appLibraryService.loadSomeApp(text)
      .subscribe(
        data => {
          this.apps = data;
        }
      );
  }

  filterTechnologyByDAD(DAD){
    this.DAD = DAD;
    this.getAppByCheckBox();
  }

  filterTechnologyByDIMS(DMIS){
    this.DIMS = DMIS;
    this.getAppByCheckBox();
  }

  filterTechnologyByGCMS(GCMS){
    this.GCMS = GCMS;
    this.getAppByCheckBox();
  }

  filterTechnologyByLCMS(LCMS){
    this.LCMS = LCMS;
    this.getAppByCheckBox();
  }

  filterTechnologyByNMR(NMR){
    this.NMR = NMR;
    this.getAppByCheckBox();
  }

  filterTechnologyByRAMAN(RAMAN){
    this.RAMAN = RAMAN;
    this.getAppByCheckBox();
  }

  filterAnalysisByAnnotation(anno){
    this.annotation = anno;
    this.getAppByCheckBox();
  }

  // filterAnalysisByNormalisation(normal){
  //   this.normalisation = normal;
  //   this.getAppByCheckBox();
  // }

  filterAnalysisByProcessing(process){
    this.processing = process;
    this.getAppByCheckBox();
  }

  filterAnalysisByStatistics(stat){
    this.statistics = stat;
    this.getAppByCheckBox();
  }

}
