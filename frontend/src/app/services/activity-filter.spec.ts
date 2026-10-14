import { ActivityItem } from './api.service';
import { filterActivities } from './activity-filter';

function activity(taskKey: string, occurredOn: string): ActivityItem {
  return {
    id: taskKey + occurredOn,
    userId: 'a',
    userName: 'Ada',
    type: 'cleaning',
    taskKey,
    weight: 5,
    completed: true,
    comment: null,
    occurredOn,
    createdAt: occurredOn
  };
}

const today = '2026-10-14';
const recent = activity('bathroom', '2026-10-11');
const old = activity('bathroom', '2026-10-01');

describe('filterActivities', () => {
  it('keeps a bathroom chore when the filter is its group or its task', () => {
    expect(filterActivities([recent], 'cleaning', 'all', today)).toEqual([recent]);
    expect(filterActivities([recent], 'bathroom', 'all', today)).toEqual([recent]);
  });

  it('drops a bathroom chore when the filter is another task', () => {
    expect(filterActivities([recent], 'trash', 'all', today)).toEqual([]);
  });

  it('drops a chore older than the last 7 days and keeps it for any time', () => {
    expect(filterActivities([old, recent], 'all', '7', today).map(item => item.id)).toEqual([recent.id]);
    expect(filterActivities([old], 'all', 'all', today)).toEqual([old]);
  });
});
