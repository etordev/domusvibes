export interface HouseholdTask {
  key: string;
  group: string;
  stars: number;
  minutes: number;
  icon: string;
}

export const HOUSEHOLD_TASKS: HouseholdTask[] = [
  { key: 'bathroom', group: 'cleaning', stars: 5, minutes: 40, icon: '🚿' },
  { key: 'kitchenclean', group: 'cleaning', stars: 4, minutes: 30, icon: '🧽' },
  { key: 'floors', group: 'cleaning', stars: 3, minutes: 25, icon: '🧹' },
  { key: 'dishes', group: 'kitchen', stars: 2, minutes: 15, icon: '🍽️' },
  { key: 'cooking', group: 'kitchen', stars: 3, minutes: 40, icon: '🍳' },
  { key: 'trash', group: 'trash', stars: 1, minutes: 5, icon: '🗑️' },
  { key: 'shopping', group: 'shopping', stars: 3, minutes: 45, icon: '🛒' },
  { key: 'tidying', group: 'tidying', stars: 2, minutes: 20, icon: '🧺' }
];

export const TASK_GROUPS = ['cleaning', 'kitchen', 'trash', 'shopping', 'tidying'];

export function householdTask(key: string | null | undefined): HouseholdTask | undefined {
  return HOUSEHOLD_TASKS.find(task => task.key === key);
}
