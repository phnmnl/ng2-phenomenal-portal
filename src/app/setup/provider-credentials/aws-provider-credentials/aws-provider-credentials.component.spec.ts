import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsProviderCredentialsComponent } from './aws-provider-credentials.component';

describe('AwsProviderCredentialsComponent', () => {
  let component: AwsProviderCredentialsComponent;
  let fixture: ComponentFixture<AwsProviderCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwsProviderCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsProviderCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
