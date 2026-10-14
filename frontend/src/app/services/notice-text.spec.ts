import { TranslateService } from '@ngx-translate/core';
import { noticeText } from './notice-text';

const phrases: Record<string, string> = {
  'Home.TurnToday': "Today it is {{name}}'s turn to {{task}}.",
  'Home.TurnInDays': "In {{days}} days it is {{name}}'s turn to {{task}}.",
  'Home.LoggedOn': '{{name}} logged {{task}} as {{outcome}} on {{date}}.',
  'Tasks.bathroom': 'Clean the bathroom',
  'Outcome.done': 'done'
};

const translate = {
  currentLang: 'en',
  instant(key: string, params?: Record<string, string | number>) {
    let text = phrases[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{{${name}}}`, String(value));
      }
    }
    return text;
  }
} as TranslateService;

describe('noticeText', () => {
  it('turns a saved turn into today or in a few days', () => {
    expect(noticeText(translate, 'turn|bathroom|2026-10-11|Ada|0'))
      .toBe("Today it is Ada's turn to Clean the bathroom.");
    expect(noticeText(translate, 'turn|bathroom|2026-10-14|Ada|3'))
      .toBe("In 3 days it is Ada's turn to Clean the bathroom.");
  });

  it('turns a logged activity into the normal sentence', () => {
    expect(noticeText(translate, 'activity|Ada|bathroom|done|2026-10-11'))
      .toMatch(/^Ada logged Clean the bathroom as done on /);
  });

  it('leaves an unknown message unchanged', () => {
    expect(noticeText(translate, 'hello there')).toBe('hello there');
  });
});
