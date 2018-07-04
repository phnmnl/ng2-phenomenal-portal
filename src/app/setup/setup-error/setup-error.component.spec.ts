import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupErrorComponent } from './setup-error.component';

describe('SetupErrorComponent', () => {
  let component: SetupErrorComponent;
  let fixture: ComponentFixture<SetupErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
