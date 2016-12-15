import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ph-progress-bar-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Cloud Research Environment Installation</h4>
    </div>
    <div class="modal-body">
      <ph-progress-bar [progress]="progress"></ph-progress-bar>
    </div>
    <div *ngIf="progress <= 100">
      <p>{{status[progress/10]}}</p>
    </div>
    <div *ngIf="progress > 100">
      <a type="button" class="btn btn-primary" [routerLink]="['/cre-dashboard']">Installation Complete</a>
    </div>
  `
})

export class ProgressBarModalContentComponent implements OnInit, OnDestroy {
  progress: number = 0;
  status: string[] = ['Connecting to cloud server ...',
    'Download dependency ...',
    'Setting up ...',
    'Configurating ...',
    'Nearly done ...',
    'Almost done ...',
    'Be patient ...',
    'Get ready ...',
    '3...',
    '2...',
    '1...'
  ];
  id;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.increaseByFive();
    this.id = setInterval(() => {
      this.increaseByFive();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  increaseByFive() {
    this.progress += 10;
  }
}

@Component({
  selector: 'ph-progress-bar-modal',
  templateUrl: './progress-bar-modal.component.html',
  styleUrls: ['./progress-bar-modal.component.css']
})
export class ProgressBarModalComponent {
  @Input() img: string;
  @Input() title: string;
  constructor(private modalService: NgbModal) {}

  open() {
    const modalRef = this.modalService.open(ProgressBarModalContentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.img = this.img;
    modalRef.componentInstance.title = this.title;
  }
}
