import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AppConfig } from "../../../app.config";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'ph-modal-dialog-content',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div style="text-align: center">
      <div class="modal-header">
        <h4 class="modal-title text-center">{{title}}</h4>
      </div>
      <div class="modal-body">
        {{body}}
      </div>

      <div class="modal-footer text-center">
        <button type="button" class="btn btn-primary" (click)="confirm()">Yes</button>
        <button type="button" class="btn btn-primary" (click)="activeModal.close('Close click')">No</button>
      </div>
    </div>
  `
})

export class ModalDialogContentComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() body: string;
  @Input() onConfirm: EventEmitter<boolean>;

  constructor(private config: AppConfig,
              public activeModal: NgbActiveModal) {
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
  selector: 'ph-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ModalDialogComponent implements OnInit {

  @Input() title: string;
  @Input() body: string;
  @Output() onConfirm = new EventEmitter<boolean>();

  constructor(private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  open() {
    const modalRef = this.modalService.open(ModalDialogContentComponent, {
      windowClass: 'progress-bar-modal',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.title = this.title;
    modalRef.componentInstance.body = this.body;
    modalRef.componentInstance.onConfirm = this.onConfirm;
  }
}



