import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployConfirmComponent } from './deploy-confirm.component';

describe('DeployConfirmComponent', () => {
  let component: DeployConfirmComponent;
  let fixture: ComponentFixture<DeployConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeployConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
