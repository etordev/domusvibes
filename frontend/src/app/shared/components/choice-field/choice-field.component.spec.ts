import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoiceFieldComponent } from './choice-field.component';

describe('ChoiceFieldComponent', () => {
  let fixture: ComponentFixture<ChoiceFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceFieldComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChoiceFieldComponent);
    fixture.componentRef.setInput('value', 'bathroom');
    fixture.componentRef.setInput('options', [
      { value: 'bathroom', label: '🚿 Clean the bathroom', group: 'Cleaning' },
      { value: 'dishes', label: '🍽️ Wash the dishes', group: 'Kitchen' }
    ]);
    fixture.detectChanges();
  });

  it('reports Wash the dishes and closes the list', () => {
    const chosen: string[] = [];
    fixture.componentInstance.valueChange.subscribe(value => chosen.push(value));

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const dishes = [...fixture.nativeElement.querySelectorAll('.choice-panel button')]
      .find(button => button.textContent.includes('Wash the dishes'));
    dishes.click();
    fixture.detectChanges();

    expect(chosen).toEqual(['dishes']);
    expect(fixture.nativeElement.querySelector('.choice-panel')).toBeNull();
  });
});
