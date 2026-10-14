export interface HomeChanged {
  homeId: string;
  actorUserId: string;
  actorName: string;
  kind: string;
  message: string;
  alert: string | null;
  score: number;
}

export interface MyStatus {
  mood: string;
  energy: string;
  availability: string;
}

export interface MemberStatus {
  userId: string;
  name: string;
  role: string;
  mood: string | null;
  energy: string | null;
  availability: string | null;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  type: string;
  taskKey: string | null;
  weight: number;
  completed: boolean;
  comment: string | null;
  occurredOn: string;
  createdAt: string;
}

export interface ShareItem {
  userId: string;
  name: string;
  points: number;
  percent: number;
}

export interface TaskSuggestion {
  kind: string;
  yours: number;
  otherName: string | null;
  theirs: number;
  taskKeys: string[];
}

export interface HomeTurnItem {
  id: string;
  taskKey: string;
  intervalDays: number;
  alertDays: number;
  dueOn: string;
  daysUntil: number;
  userId: string;
  userName: string;
}

export interface PulsePoint {
  day: string;
  score: number | null;
}

export interface HomeDashboard {
  homeId: string;
  homeName: string;
  score: number;
  lowMood: boolean;
  alert: string | null;
  moodScore: number;
  energyScore: number;
  completedCount: number;
  missedCount: number;
  positiveNotes: number;
  averageMood: string;
  averageEnergy: string;
  myStatus: MyStatus | null;
  members: MemberStatus[];
  recentActivities: ActivityItem[];
  history: PulsePoint[];
  shares: ShareItem[];
  suggestion: TaskSuggestion | null;
  turns: HomeTurnItem[];
}

export interface DailyStatusRequest {
  homeId: string;
  userId: string;
  mood: string;
  energy: string;
  availability: string;
}

export interface LogActivityRequest {
  homeId: string;
  userId: string;
  type: string;
  taskKey: string;
  weight: number;
  completed: boolean;
  comment: string | null;
  occurredOn: string;
}

export interface UpdateActivityRequest extends LogActivityRequest {
  activityId: string;
}

export interface SaveTurnRequest {
  homeId: string;
  userId: string;
  taskKey: string;
  intervalDays: number;
  alertDays: number;
  startsOn: string;
  memberIds: string[];
}

export interface UpdateHomeRequest {
  homeId: string;
  executorUserId: string;
  newName: string;
}

export interface UpdateMemberRoleRequest {
  homeId: string;
  executorUserId: string;
  targetUserId: string;
  role: string;
}

export interface RemoveMemberRequest {
  homeId: string;
  executorUserId: string;
  targetUserId: string;
}

export interface GenerateInviteCodeRequest {
  homeId: string;
  executorUserId: string;
}

export interface GenerateInviteCodeResponse {
  inviteCode: string;
}
