import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreRegistrationFormComponent } from './cre-registration-form.component';

describe('CreRegistrationFormComponent', () => {
  let component: CreRegistrationFormComponent;
  let fixture: ComponentFixture<CreRegistrationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreRegistrationFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreRegistrationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
