import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsSetupComponent } from './aws-setup.component';

describe('AwsSetupComponent', () => {
  let component: AwsSetupComponent;
  let fixture: ComponentFixture<AwsSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwsSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
