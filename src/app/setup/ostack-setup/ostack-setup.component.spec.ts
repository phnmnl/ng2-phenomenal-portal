import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OstackSetupComponent } from './ostack-setup.component';

describe('OstackSetupComponent', () => {
  let component: OstackSetupComponent;
  let fixture: ComponentFixture<OstackSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OstackSetupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OstackSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
