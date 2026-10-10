import { TranslateService } from '@ngx-translate/core';

const knownNotices: Record<string, string> = {
  'The house mood is low.': 'Home.LowMoodAlert',
  'A tenant was removed from the home.': 'Home.TenantRemoved',
  'The home name was updated.': 'Home.NameUpdated',
  "A tenant's role was updated.": 'Home.RoleUpdated'
};

const englishTasks: Record<string, string> = {
  cleaning: 'cleaning',
  shopping: 'shopping',
  'the kitchen': 'kitchen',
  'the trash': 'trash',
  tidying: 'tidying'
};

const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function noticeText(translate: TranslateService, message: string): string {
  const key = knownNotices[message];
  if (key) return translate.instant(key);

  const structuredActivity = /^activity\|([^|]*)\|([^|]*)\|(done|missed)\|(\d{4}-\d{2}-\d{2})$/.exec(message);
  if (structuredActivity) {
    return loggedOn(translate, structuredActivity[1], structuredActivity[2], structuredActivity[3], structuredActivity[4]);
  }

  const englishActivity = /^(.+) logged (.+) as (done|missed) on (\d{1,2}) ([A-Za-z]{3})\.?$/.exec(message);
  if (englishActivity) {
    const month = englishMonths.indexOf(englishActivity[5]);
    const task = englishTasks[englishActivity[2].toLowerCase()];
    if (month >= 0 && task) {
      const day = englishActivity[4].padStart(2, '0');
      const monthNumber = String(month + 1).padStart(2, '0');
      const year = new Date().getFullYear();
      return loggedOn(translate, englishActivity[1], task, englishActivity[3], `${year}-${monthNumber}-${day}`);
    }
  }

  const structuredStatus = /^status\|([^|]*)$/.exec(message);
  if (structuredStatus) {
    return translate.instant('Home.CheckinNotice', { name: structuredStatus[1] });
  }

  const englishStatus = /^(.+) updated today's check-in\.$/.exec(message);
  if (englishStatus) {
    return translate.instant('Home.CheckinNotice', { name: englishStatus[1] });
  }

  return message;
}

function loggedOn(translate: TranslateService, name: string, task: string, outcome: string, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const formatted = Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString(translate.currentLang || 'en', { day: 'numeric', month: 'short' });
  const taskLabel = translate.instant(`Tasks.${task}`);
  return translate.instant('Home.LoggedOn', {
    name,
    task: taskLabel.startsWith('Tasks.') ? task : taskLabel,
    outcome: translate.instant(`Outcome.${outcome}`),
    date: formatted
  });
}
