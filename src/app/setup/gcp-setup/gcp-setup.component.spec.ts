import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcpSetupComponent } from './gcp-setup.component';

describe('GcpSetupComponent', () => {
  let component: GcpSetupComponent;
  let fixture: ComponentFixture<GcpSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GcpSetupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcpSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
