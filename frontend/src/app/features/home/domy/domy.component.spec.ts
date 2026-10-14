import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HomeDashboard } from '../models/home.model';
import { DomyComponent } from './domy.component';

const phrases = {
  Domy: {
    Hello: 'Hi, I am Domy.',
    AskPulse: 'How is the house today?',
    AskTurn: 'Whose turn is next?',
    AskFair: 'What should I do?',
    AskShare: 'Who did less lately?',
    Hide: 'Hide',
    Show: 'Show Domy',
    PulseNone: 'Score {{score}}. Nobody checked in.',
    ShareIntro: 'Shares:',
    Least: '{{name}} has the smallest share, {{percent}}%.'
  },
  Home: {
    Counts: '{{done}} done, {{missed}} missed, {{notes}} notes.',
    TurnToday: "Today it is {{name}}'s turn to {{task}}.",
    SuggestionEven: 'The tasks are shared fairly. You did {{yours}}%.'
  },
  Tasks: {
    bathroom: 'Clean the bathroom'
  }
};

function home(): HomeDashboard {
  return {
    homeId: 'home',
    homeName: 'Tabs Home',
    score: 68,
    lowMood: false,
    alert: null,
    moodScore: 0,
    energyScore: 0,
    completedCount: 1,
    missedCount: 0,
    positiveNotes: 0,
    averageMood: 'none',
    averageEnergy: 'none',
    myStatus: null,
    members: [],
    recentActivities: [],
    history: [],
    shares: [
      { userId: 'a', name: 'Ada', points: 2, percent: 40 },
      { userId: 'b', name: 'Bea', points: 3, percent: 60 }
    ],
    suggestion: { kind: 'even', yours: 40, otherName: null, theirs: 60, taskKeys: [] },
    turns: [{
      id: 'turn',
      taskKey: 'bathroom',
      intervalDays: 7,
      alertDays: 3,
      dueOn: '2026-10-14',
      daysUntil: 0,
      userId: 'a',
      userName: 'Ada'
    }]
  };
}

describe('DomyComponent', () => {
  let fixture: ComponentFixture<DomyComponent>;

  beforeEach(async () => {
    localStorage.removeItem('domy-hidden');
    await TestBed.configureTestingModule({
      imports: [DomyComponent, TranslateModule.forRoot()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', phrases);
    translate.setDefaultLang('en');
    translate.use('en');

    fixture = TestBed.createComponent(DomyComponent);
    fixture.componentRef.setInput('details', home());
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('answers the four questions from this home', () => {
    open();
    ask('How is the house today?');
    ask('Whose turn is next?');
    ask('What should I do?');
    ask('Who did less lately?');

    const answers = [...fixture.nativeElement.querySelectorAll('.domy-log p')]
      .map(item => item.textContent.trim());

    expect(answers).toContain('How is the house today?');
    expect(answers).toContain('Score 68. Nobody checked in. 1 done, 0 missed, 0 notes.');
    expect(answers).toContain("Today it is Ada's turn to Clean the bathroom.");
    expect(answers).toContain('The tasks are shared fairly. You did 40%.');
    expect(answers.some((line: string) => line.includes('Ada 40%') && line.includes('Bea 60%'))).toBe(true);
    expect(answers.some((line: string) => line.includes('Ada has the smallest share, 40%.'))).toBe(true);
  });

  it('hides the house and shows it again', () => {
    open();
    fixture.nativeElement.querySelector('.hide').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.domy-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.domy-show').textContent).toContain('Show Domy');
    expect(localStorage.getItem('domy-hidden')).toBe('1');

    fixture.nativeElement.querySelector('.domy-show').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.domy-button')).not.toBeNull();
    expect(localStorage.getItem('domy-hidden')).toBeNull();
  });

  function open() {
    fixture.nativeElement.querySelector('.domy-button').click();
    fixture.detectChanges();
  }

  function ask(label: string) {
    const button = [...fixture.nativeElement.querySelectorAll('.domy-prompts button')]
      .find(item => item.textContent.trim() === label);
    button.click();
    fixture.detectChanges();
  }
});
