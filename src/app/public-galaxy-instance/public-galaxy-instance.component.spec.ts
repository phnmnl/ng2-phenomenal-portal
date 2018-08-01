import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicGalaxyInstanceComponent } from './public-galaxy-instance.component';

describe('PublicGalaxyInstanceComponent', () => {
  let component: PublicGalaxyInstanceComponent;
  let fixture: ComponentFixture<PublicGalaxyInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicGalaxyInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicGalaxyInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
