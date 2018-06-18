import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorModalDialogComponent } from './error-modal-dialog.component';

describe('ErrorModalDialogComponent', () => {
  let component: ErrorModalDialogComponent;
  let fixture: ComponentFixture<ErrorModalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorModalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
