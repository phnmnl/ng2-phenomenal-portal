import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderParametersComponent } from './provider-parameters.component';

describe('ProviderParametersComponent', () => {
  let component: ProviderParametersComponent;
  let fixture: ComponentFixture<ProviderParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
