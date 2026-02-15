// ==========================================
// データモデル型定義
// ==========================================

// 顧客
export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 案件ステータス
export type ProjectStatus = 'prospect' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'deepening';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  prospect: '見込み',
  proposal: '提案中',
  negotiation: '交渉中',
  won: '成約',
  lost: '失注',
  deepening: '深耕',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  prospect: '#6366f1',
  proposal: '#f59e0b',
  negotiation: '#3b82f6',
  won: '#10b981',
  lost: '#ef4444',
  deepening: '#8b5cf6',
};

// 案件
export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// 活動タイプ
export type ActivityType = 'appointment' | 'call' | 'email' | 'meeting' | 'other';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  appointment: 'アポイント',
  call: '電話',
  email: 'メール',
  meeting: '会議',
  other: 'その他',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  appointment: '📅',
  call: '📞',
  email: '✉️',
  meeting: '🤝',
  other: '📝',
};

// 活動ログ
export interface Activity {
  id: string;
  projectId: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

// 議事メモ
export interface MeetingNote {
  id: string;
  projectId: string;
  clientId: string;
  activityId?: string;
  fileName: string;
  content: string;
  uploadedAt: string;
}

// アプリケーション全体のデータ
export interface AppData {
  clients: Client[];
  projects: Project[];
  activities: Activity[];
  meetingNotes: MeetingNote[];
}

// GitHub設定
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}
