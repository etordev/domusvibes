import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateFieldComponent } from './date-field.component';
import { LanguageService } from '../../../core/language.service';

describe('DateFieldComponent', () => {
  let fixture: ComponentFixture<DateFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFieldComponent],
      providers: [{ provide: LanguageService, useValue: { current: signal('en') } }]
    }).compileComponents();

    fixture = TestBed.createComponent(DateFieldComponent);
    fixture.componentRef.setInput('value', '2026-10-01');
    fixture.componentRef.setInput('max', '2026-10-11');
    fixture.detectChanges();
  });

  it('reports the day that was chosen', () => {
    const chosen: string[] = [];
    fixture.componentInstance.valueChange.subscribe(value => chosen.push(value));

    open();
    day('10').click();
    fixture.detectChanges();

    expect(chosen).toEqual(['2026-10-10']);
    expect(fixture.nativeElement.querySelector('.date-panel')).toBeNull();
  });

  it('keeps a day after the maximum disabled', () => {
    open();
    expect(day('12').disabled).toBe(true);
  });

  function open() {
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
  }

  function day(number: string): HTMLButtonElement {
    const button = [...fixture.nativeElement.querySelectorAll('.date-grid button')]
      .find(item => item.textContent.trim() === number && !item.classList.contains('muted'));
    if (!button) throw new Error(`Missing day ${number}`);
    return button;
  }
});
