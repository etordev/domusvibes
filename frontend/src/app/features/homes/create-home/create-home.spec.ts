import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHome } from './create-home';

describe('CreateHome', () => {
  let component: CreateHome;
  let fixture: ComponentFixture<CreateHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
