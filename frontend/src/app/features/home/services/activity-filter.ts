import { ActivityItem } from '../models/home.model';
import { householdTask } from '../models/household-tasks';

export function filterActivities(
  items: ActivityItem[],
  task: string,
  when: string,
  today: string
): ActivityItem[] {
  return items.filter(activity => {
    const key = activity.taskKey || activity.type;
    const group = householdTask(key)?.group ?? activity.type;
    if (task !== 'all' && task !== key && task !== group) return false;
    if (when === 'all') return true;
    const start = shiftDate(today, 1 - Number(when));
    return activity.occurredOn.slice(0, 10) >= start;
  });
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
