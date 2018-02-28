import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCreComponent } from './test-cre.component';

describe('TestCreComponent', () => {
  let component: TestCreComponent;
  let fixture: ComponentFixture<TestCreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
