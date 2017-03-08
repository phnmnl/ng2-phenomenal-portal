import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudDescriptionLayoutComponent } from './cloud-description-layout.component';

describe('CloudDescriptionLayoutComponent', () => {
  let component: CloudDescriptionLayoutComponent;
  let fixture: ComponentFixture<CloudDescriptionLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudDescriptionLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudDescriptionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
