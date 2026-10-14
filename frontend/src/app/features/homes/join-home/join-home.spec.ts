import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinHome } from './join-home';

describe('JoinHome', () => {
  let component: JoinHome;
  let fixture: ComponentFixture<JoinHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
