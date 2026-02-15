// ==========================================
// GitHub API クライアント
// ==========================================

import { GitHubConfig } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubFileResponse {
    content: string;
    sha: string;
    encoding: string;
}

// GitHub設定をlocalStorageから読取
export function getGitHubConfig(): GitHubConfig | null {
    const raw = localStorage.getItem('github_config');
    if (!raw) return null;
    try {
        return JSON.parse(raw) as GitHubConfig;
    } catch {
        return null;
    }
}

// GitHub設定をlocalStorageへ保存
export function saveGitHubConfig(config: GitHubConfig): void {
    localStorage.setItem('github_config', JSON.stringify(config));
}

// SHAキャッシュ（楽観的ロック用）
const shaCache: Record<string, string> = {};

// ファイル内容を取得
export async function getFileContent<T>(path: string): Promise<T | null> {
    const config = getGitHubConfig();
    if (!config) throw new Error('GitHub設定が見つかりません。設定画面でトークンを登録してください。');

    const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${config.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (res.status === 404) {
            return null;
        }

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`GitHub API エラー: ${res.status} - ${error}`);
        }

        const data: GitHubFileResponse = await res.json();
        shaCache[path] = data.sha;

        const decoded = atob(data.content);
        const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
        const text = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(text) as T;
    } catch (err) {
        if (err instanceof Error && err.message.includes('GitHub API エラー')) {
            throw err;
        }
        throw new Error(`データの取得に失敗しました: ${(err as Error).message}`);
    }
}

// ファイル内容を保存（作成 or 更新）
export async function saveFileContent<T>(path: string, data: T, message?: string): Promise<void> {
    const config = getGitHubConfig();
    if (!config) throw new Error('GitHub設定が見つかりません。設定画面でトークンを登録してください。');

    const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const body: Record<string, string> = {
        message: message || `Update ${path}`,
        content,
        branch: config.branch,
    };

    // SHAがキャッシュにあれば使用（更新時に必要）
    if (shaCache[path]) {
        body.sha = shaCache[path];
    }

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (res.status === 409) {
        // 競合検知 - 最新データを取得してリトライ
        throw new Error('データの競合が発生しました。ページを再読み込みして再度お試しください。');
    }

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`GitHub API エラー: ${res.status} - ${error}`);
    }

    const result = await res.json();
    shaCache[path] = result.content.sha;
}

// 接続テスト
export async function testConnection(): Promise<{ success: boolean; message: string }> {
    const config = getGitHubConfig();
    if (!config) {
        return { success: false, message: '設定が見つかりません' };
    }

    try {
        const res = await fetch(`${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`, {
            headers: {
                Authorization: `Bearer ${config.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (res.ok) {
            const repo = await res.json();
            return { success: true, message: `接続成功: ${repo.full_name}` };
        } else {
            return { success: false, message: `接続失敗: ${res.status} ${res.statusText}` };
        }
    } catch (err) {
        return { success: false, message: `接続エラー: ${(err as Error).message}` };
    }
}
