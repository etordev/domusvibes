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

  const structuredActivity = /^(activity|activity-updated|activity-removed)\|([^|]*)\|([^|]*)\|(done|missed)\|(\d{4}-\d{2}-\d{2})$/.exec(message);
  if (structuredActivity) {
    const key = structuredActivity[1] === 'activity-updated'
      ? 'Home.UpdatedOn'
      : structuredActivity[1] === 'activity-removed'
        ? 'Home.RemovedOn'
        : 'Home.LoggedOn';
    return activityLine(translate, key, structuredActivity[2], structuredActivity[3], structuredActivity[4], structuredActivity[5]);
  }

  const englishActivity = /^(.+) logged (.+) as (done|missed) on (\d{1,2}) ([A-Za-z]{3})\.?$/.exec(message);
  if (englishActivity) {
    const month = englishMonths.indexOf(englishActivity[5]);
    const task = englishTasks[englishActivity[2].toLowerCase()];
    if (month >= 0 && task) {
      const day = englishActivity[4].padStart(2, '0');
      const monthNumber = String(month + 1).padStart(2, '0');
      const year = new Date().getFullYear();
      return activityLine(translate, 'Home.LoggedOn', englishActivity[1], task, englishActivity[3], `${year}-${monthNumber}-${day}`);
    }
  }

  const turn = /^turn\|([^|]*)\|(\d{4}-\d{2}-\d{2})\|([^|]*)\|(\d+)$/.exec(message);
  if (turn) {
    const days = Number(turn[4]);
    const taskKey = `Tasks.${turn[1]}`;
    const taskLabel = translate.instant(taskKey);
    const task = taskLabel === taskKey ? turn[1] : taskLabel;
    if (days <= 0) return translate.instant('Home.TurnToday', { name: turn[3], task });
    if (days === 1) return translate.instant('Home.TurnTomorrow', { name: turn[3], task });
    return translate.instant('Home.TurnInDays', { days, name: turn[3], task });
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

function activityLine(translate: TranslateService, key: string, name: string, task: string, outcome: string, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const formatted = Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString(translate.currentLang || 'en', { day: 'numeric', month: 'short' });
  const taskLabel = translate.instant(`Tasks.${task}`);
  return translate.instant(key, {
    name,
    task: taskLabel.startsWith('Tasks.') ? task : taskLabel,
    outcome: translate.instant(`Outcome.${outcome}`),
    date: formatted
  });
}
