import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenstackProviderCredentialsComponent } from './openstack-provider-credentials.component';

describe('OpenstackProviderCredentialsComponent', () => {
  let component: OpenstackProviderCredentialsComponent;
  let fixture: ComponentFixture<OpenstackProviderCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenstackProviderCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenstackProviderCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
