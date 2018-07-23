import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreconfiguredOpenstackProviderCredentialsComponent } from './preconfigured-openstack-provider-credentials.component';

describe('PreconfiguredOpenstackProviderCredentialsComponent', () => {
  let component: PreconfiguredOpenstackProviderCredentialsComponent;
  let fixture: ComponentFixture<PreconfiguredOpenstackProviderCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreconfiguredOpenstackProviderCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreconfiguredOpenstackProviderCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
