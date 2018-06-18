import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { Error } from "../../service/error/Error";
import { ErrorService } from "../../service/error/error.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap/modal/modal-ref";
import { Component, EventEmitter, Input, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'ph-error-modal-dialog-content',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './error-modal-dialog-content.component.html',
  styleUrls: ['./error-modal-dialog-content.component.css']
})
export class ErrorModalDialogContentComponent implements OnInit {

  @Input() body: string = "";
  @Input() title: string = "";
  @Input() callback: any = null;
  public error_icon = 'assets/img/error-icon.png';
  @Input() onConfirm: EventEmitter<boolean>;

  constructor(private config: AppConfig,
              public activeModal: NgbActiveModal, private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public confirm() {
    if (this.onConfirm)
      this.onConfirm.emit(true);
  }
}


@Component({
  selector: 'ph-error-modal-dialog',
  template: '',
  styleUrls: ['./error-modal-dialog.component.css']
})
export class ErrorModalDialogComponent implements OnInit {

  private ERRORS = {
    "401": {
      'title': "Authentication Error",
      'message': "User session expired! Please click on 'Continue' to re-authenticate!!!",
      'callback': () => {
        this.router.navigate(['/login']);
      }
    }
  };

  constructor(private config: AppConfig, private router: Router,
              private modalService: NgbModal, private errorService: ErrorService) {
  }

  ngOnInit() {
    this.errorService.getErrorAsObservable().subscribe((error: Error) => {
      console.log("Error object", error);
      if (error.code in this.ERRORS)
        this.showError(error);
    });
  }

  ngOnDestroy() {
  }

  showError(error: Error) {
    let modalRef = this.modalService.open(ErrorModalDialogContentComponent, {
      windowClass: 'error-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.onConfirm = new EventEmitter();
    modalRef.componentInstance.onConfirm.subscribe((ok) => {
      let callback = modalRef.componentInstance.callback;
      modalRef.close();
      if (callback) {
        callback();
      }
    });
    this.setErrorMessage(modalRef, error);
  }

  private setErrorMessage(modalRef: NgbModalRef, error: Error) {
    let info = this.ERRORS[error.code] ? this.ERRORS[error.code] : error;
    modalRef.componentInstance.title = info.title ? info.title : "App Error";
    modalRef.componentInstance.body = info.message;
    modalRef.componentInstance.callback = info.callback;
    console.log("Setting error on ErrorModalDialog", error);
  }
}
