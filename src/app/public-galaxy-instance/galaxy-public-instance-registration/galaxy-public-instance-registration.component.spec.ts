import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalaxyPublicInstanceRegistrationComponent } from './galaxy-public-instance-registration.component';

describe('GalaxyPublicInstanceRegistrationComponent', () => {
  let component: GalaxyPublicInstanceRegistrationComponent;
  let fixture: ComponentFixture<GalaxyPublicInstanceRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalaxyPublicInstanceRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalaxyPublicInstanceRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
