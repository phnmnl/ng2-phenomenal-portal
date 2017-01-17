import {Component, ViewEncapsulation, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'ph-ngbd-modal-content',
  template: `
    <div class="modal-header">
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
      <h4 class="modal-title">{{ title }}</h4>
    </div>
    <div class="modal-body">
      <img [src]="img" class="img-fluid " alt="">
    </div>
  `
})

export class NgbdModalContentComponent {
  @Input() img: string;
  @Input() title: string;

  constructor(public activeModal: NgbActiveModal) {}
}

@Component({
  selector: 'ph-modal',
  templateUrl: './modal.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  @Input() img: string;
  @Input() title: string;

  constructor(private modalService: NgbModal) {}

  open() {
    const modalRef = this.modalService.open(NgbdModalContentComponent, { size: 'lg' });
    modalRef.componentInstance.img = this.img;
    modalRef.componentInstance.title = this.title;
  }
}
