import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSelectorComponent } from './provider-selector.component';

describe('ProviderSelectorComponent', () => {
  let component: ProviderSelectorComponent;
  let fixture: ComponentFixture<ProviderSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
