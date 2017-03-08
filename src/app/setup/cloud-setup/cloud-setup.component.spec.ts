import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudSetupComponent } from './cloud-setup.component';

describe('CloudSetupComponent', () => {
  let component: CloudSetupComponent;
  let fixture: ComponentFixture<CloudSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
