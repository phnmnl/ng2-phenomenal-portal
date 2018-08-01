import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcpProviderCredentialsComponent } from './gcp-provider-credentials.component';

describe('GcpProviderCredentialsComponent', () => {
  let component: GcpProviderCredentialsComponent;
  let fixture: ComponentFixture<GcpProviderCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcpProviderCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcpProviderCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
