// ==========================================
// データストレージ ユーティリティ
// ==========================================

import { AppData, Client, Project, Activity, MeetingNote } from '../types';
import { getFileContent, saveFileContent } from './github';

const DATA_PATHS = {
    clients: 'data/clients.json',
    projects: 'data/projects.json',
    activities: 'data/activities.json',
    meetingNotes: 'data/meeting-notes.json',
};

// 全データ取得
export async function loadAllData(): Promise<AppData> {
    const [clients, projects, activities, meetingNotes] = await Promise.all([
        getFileContent<Client[]>(DATA_PATHS.clients),
        getFileContent<Project[]>(DATA_PATHS.projects),
        getFileContent<Activity[]>(DATA_PATHS.activities),
        getFileContent<MeetingNote[]>(DATA_PATHS.meetingNotes),
    ]);

    return {
        clients: clients || [],
        projects: projects || [],
        activities: activities || [],
        meetingNotes: meetingNotes || [],
    };
}

// 顧客データ保存
export async function saveClients(clients: Client[]): Promise<void> {
    await saveFileContent(DATA_PATHS.clients, clients, '顧客データ更新');
}

// 案件データ保存
export async function saveProjects(projects: Project[]): Promise<void> {
    await saveFileContent(DATA_PATHS.projects, projects, '案件データ更新');
}

// 活動ログ保存
export async function saveActivities(activities: Activity[]): Promise<void> {
    await saveFileContent(DATA_PATHS.activities, activities, '活動ログ更新');
}

// 議事メモ保存
export async function saveMeetingNotes(notes: MeetingNote[]): Promise<void> {
    await saveFileContent(DATA_PATHS.meetingNotes, notes, '議事メモ更新');
}

// UID生成
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 日時文字列生成
export function nowISO(): string {
    return new Date().toISOString();
}

// サンプルデータのシード
export function getSeedData(): AppData {
    const now = nowISO();
    const clients: Client[] = [
        {
            id: 'c1',
            companyName: '株式会社サンプル商事',
            contactPerson: '田中 太郎',
            email: 'tanaka@sample.co.jp',
            phone: '03-1234-5678',
            address: '東京都千代田区丸の内1-1-1',
            notes: '年間契約の可能性あり',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'c2',
            companyName: '合同会社テスト工業',
            contactPerson: '鈴木 花子',
            email: 'suzuki@test-ind.co.jp',
            phone: '06-9876-5432',
            address: '大阪府大阪市北区梅田2-2-2',
            notes: 'DX推進に関心あり',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'c3',
            companyName: '株式会社イノベーション',
            contactPerson: '佐藤 次郎',
            email: 'sato@innovation.co.jp',
            phone: '052-111-2222',
            address: '愛知県名古屋市中区栄3-3-3',
            notes: '新規事業立ち上げ支援を検討中',
            createdAt: now,
            updatedAt: now,
        },
    ];

    const projects: Project[] = [
        {
            id: 'p1',
            clientId: 'c1',
            title: 'DX推進コンサルティング',
            description: '業務プロセスのデジタル化支援',
            status: 'proposal',
            amount: 5000000,
            startDate: '2026-03-01',
            endDate: '2026-08-31',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'p2',
            clientId: 'c2',
            title: '組織改革プロジェクト',
            description: '組織体制の見直しと改善提案',
            status: 'prospect',
            amount: 3000000,
            startDate: '2026-04-01',
            endDate: '2026-09-30',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'p3',
            clientId: 'c1',
            title: 'IT戦略策定支援',
            description: '中期IT戦略の策定支援',
            status: 'won',
            amount: 8000000,
            startDate: '2026-01-01',
            endDate: '2026-06-30',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'p4',
            clientId: 'c3',
            title: '新規事業企画コンサル',
            description: '新規事業のフィージビリティスタディ',
            status: 'negotiation',
            amount: 4500000,
            startDate: '2026-05-01',
            endDate: '2026-10-31',
            createdAt: now,
            updatedAt: now,
        },
    ];

    const activities: Activity[] = [
        {
            id: 'a1',
            projectId: 'p1',
            clientId: 'c1',
            type: 'meeting',
            title: '初回ヒアリング',
            description: '現状の業務フローについて確認。デジタル化の優先領域を議論。',
            date: '2026-02-10',
            createdAt: now,
        },
        {
            id: 'a2',
            projectId: 'p3',
            clientId: 'c1',
            type: 'appointment',
            title: '中間報告会',
            description: 'IT戦略の中間レポートを報告。方向性について合意。',
            date: '2026-02-05',
            createdAt: now,
        },
        {
            id: 'a3',
            projectId: 'p2',
            clientId: 'c2',
            type: 'call',
            title: '電話でのフォローアップ',
            description: '提案書の送付スケジュールについて確認。',
            date: '2026-02-11',
            createdAt: now,
        },
    ];

    const meetingNotes: MeetingNote[] = [
        {
            id: 'mn1',
            projectId: 'p1',
            clientId: 'c1',
            activityId: 'a1',
            fileName: '初回ヒアリング議事メモ.txt',
            content:
                '日時: 2026/02/10 14:00-15:30\n場所: サンプル商事 本社\n参加者: 田中部長、山田課長、当社：鈴木、佐々木\n\n■議題\n1. 現状の業務フロー確認\n2. デジタル化の優先領域\n3. 今後のスケジュール\n\n■議論内容\n・受発注業務のペーパーレス化が急務\n・在庫管理の見える化も検討したい\n・4月以降の本格始動を希望',
            uploadedAt: now,
        },
    ];

    return { clients, projects, activities, meetingNotes };
}

// サンプルデータを保存（逐次実行：GitHub API の競合を回避）
export async function seedData(): Promise<void> {
    const data = getSeedData();
    await saveClients(data.clients);
    await saveProjects(data.projects);
    await saveActivities(data.activities);
    await saveMeetingNotes(data.meetingNotes);
}
