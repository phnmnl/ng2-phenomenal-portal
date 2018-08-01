import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCredentialsComponent } from './services-credentials.component';

describe('ServicesCredentialsComponent', () => {
  let component: ServicesCredentialsComponent;
  let fixture: ComponentFixture<ServicesCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
