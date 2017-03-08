import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhenomenalSetupComponent } from './phenomenal-setup.component';

describe('PhenomenalSetupComponent', () => {
  let component: PhenomenalSetupComponent;
  let fixture: ComponentFixture<PhenomenalSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhenomenalSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhenomenalSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
