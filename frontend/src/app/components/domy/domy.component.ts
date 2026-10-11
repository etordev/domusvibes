import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HomeDashboard, HomeTurnItem, TaskSuggestion } from '../../services/api.service';
import { householdTask } from '../../services/household-tasks';
import { LanguageService } from '../../services/language.service';

type DomyTopic = 'pulse' | 'turn' | 'fair' | 'share';

interface DomyMessage {
  from: 'domy' | 'you';
  text: string;
}

@Component({
  selector: 'app-domy',
  standalone: true,
  imports: [TranslateModule, NgTemplateOutlet],
  templateUrl: './domy.component.html',
  styleUrl: './domy.component.scss'
})
export class DomyComponent {
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly log = viewChild<ElementRef<HTMLElement>>('log');

  readonly details = input.required<HomeDashboard>();
  readonly open = signal(false);
  readonly hidden = signal(false);
  readonly messages = signal<DomyMessage[]>([]);

  constructor() {
    afterNextRender(() => {
      this.hidden.set(localStorage.getItem('domy-hidden') === '1');
    });
  }

  hide() {
    this.open.set(false);
    this.hidden.set(true);
    localStorage.setItem('domy-hidden', '1');
  }

  show() {
    localStorage.removeItem('domy-hidden');
    this.hidden.set(false);
  }

  toggle() {
    const opening = !this.open();
    this.open.set(opening);
    if (opening && this.messages().length === 0) {
      this.messages.set([{ from: 'domy', text: this.say('Domy.Hello') }]);
    }
  }

  ask(topic: DomyTopic) {
    const key = topic === 'pulse' ? 'AskPulse' : topic === 'turn' ? 'AskTurn' : topic === 'fair' ? 'AskFair' : 'AskShare';
    this.reply(this.say(`Domy.${key}`), topic);
  }

  private reply(question: string, topic: DomyTopic) {
    this.messages.update(messages => [
      ...messages,
      { from: 'you', text: question },
      { from: 'domy', text: this.answer(topic) }
    ]);
    setTimeout(() => {
      const element = this.log()?.nativeElement;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }

  private answer(topic: DomyTopic): string {
    this.language.current();
    const home = this.details();
    if (topic === 'pulse') return this.pulse(home);
    if (topic === 'turn') return this.turns(home.turns);
    if (topic === 'fair') return this.fair(home.suggestion);
    return this.shares(home);
  }

  private pulse(home: HomeDashboard): string {
    const summary = home.averageMood === 'none'
      ? this.say('Domy.PulseNone', { score: home.score })
      : this.say('Domy.Pulse', {
          score: home.score,
          summary: this.say('Home.MoodSummary', {
            mood: this.say(`Mood.${home.averageMood}`),
            energy: this.say(`Energy.${home.averageEnergy}`)
          })
        });
    const counts = this.say('Home.Counts', {
      done: home.completedCount,
      missed: home.missedCount,
      notes: home.positiveNotes
    });
    return `${summary} ${counts}`;
  }

  private turns(turns: HomeTurnItem[]): string {
    if (turns.length === 0) return this.say('Domy.NoTurns');
    return [...turns]
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .map(turn => this.turnLine(turn))
      .join('\n');
  }

  private turnLine(turn: HomeTurnItem): string {
    const task = this.taskLabel(turn.taskKey);
    if (turn.daysUntil <= 0) return this.say('Home.TurnToday', { name: turn.userName, task });
    if (turn.daysUntil === 1) return this.say('Home.TurnTomorrow', { name: turn.userName, task });
    return this.say('Home.TurnInDays', { days: turn.daysUntil, name: turn.userName, task });
  }

  private fair(suggestion: TaskSuggestion | null): string {
    if (!suggestion) return this.say('Domy.NoSuggestion');
    if (suggestion.kind === 'empty') return this.say('Home.SuggestionEmpty');
    if (suggestion.kind === 'behind') {
      const text = this.say('Home.SuggestionBehind', {
        yours: suggestion.yours,
        name: suggestion.otherName ?? '',
        theirs: suggestion.theirs
      });
      const tasks = suggestion.taskKeys.map(key => `${householdTask(key)?.icon ?? ''} ${this.taskLabel(key)}`.trim());
      return tasks.length > 0 ? `${text}\n${tasks.join('\n')}` : text;
    }
    return this.say('Home.SuggestionEven', { yours: suggestion.yours });
  }

  private shares(home: HomeDashboard): string {
    if (home.shares.length === 0) return this.say('Home.SuggestionEmpty');
    const ordered = [...home.shares].sort((a, b) => a.percent - b.percent);
    const lines = ordered.map(share => `${share.name} ${share.percent}%`).join('\n');
    const intro = this.say('Domy.ShareIntro');
    const least = ordered[0];
    const even = ordered.length < 2 || least.percent === ordered.at(-1)?.percent;
    if (even) return `${intro}\n${lines}`;
    return `${intro}\n${lines}\n${this.say('Domy.Least', { name: least.name, percent: least.percent })}`;
  }

  private taskLabel(key: string): string {
    const label = this.say(`Tasks.${key}`);
    return label === `Tasks.${key}` ? key : label;
  }

  private say(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
