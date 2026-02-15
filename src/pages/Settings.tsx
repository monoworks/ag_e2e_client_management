// ==========================================
// 設定画面 - GitHub Token 設定
// ==========================================

import { useState, useEffect } from 'react';
import { getGitHubConfig, saveGitHubConfig, testConnection } from '../utils/github';
import { useApp } from '../context/AppContext';
import type { GitHubConfig } from '../types';

export default function Settings() {
    const { initSeedData } = useApp();
    const [config, setConfig] = useState<GitHubConfig>({
        token: '',
        owner: '',
        repo: '',
        branch: 'main',
    });
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string | null>(null);

    useEffect(() => {
        const saved = getGitHubConfig();
        if (saved) setConfig(saved);
    }, []);

    const handleSave = () => {
        setSaving(true);
        setTestResult(null);
        saveGitHubConfig(config);
        setTimeout(() => {
            setSaving(false);
            setTestResult({ success: true, message: '設定を保存しました' });
        }, 300);
    };

    const handleTest = async () => {
        setTestResult(null);
        saveGitHubConfig(config);
        const result = await testConnection();
        setTestResult(result);
    };

    const handleSeedData = async () => {
        setSeeding(true);
        setSeedResult(null);
        try {
            await initSeedData();
            setSeedResult('サンプルデータを投入しました。');
        } catch (err) {
            setSeedResult(`エラー: ${(err as Error).message}`);
        }
        setSeeding(false);
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>⚙️ 設定</h1>
                <p>GitHub API の接続設定を行います</p>
            </div>

            <div className="card" style={{ maxWidth: '640px', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
                    GitHub 接続設定
                </h2>

                <div className="form-group">
                    <label>Personal Access Token</label>
                    <input
                        type="password"
                        value={config.token}
                        onChange={(e) => setConfig({ ...config, token: e.target.value })}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                        GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) から発行してください。
                        <br />
                        必要な権限: <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 6px', borderRadius: '4px' }}>repo</code>
                    </p>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>オーナー (ユーザー名 or Organization)</label>
                        <input
                            type="text"
                            value={config.owner}
                            onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                            placeholder="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>リポジトリ名</label>
                        <input
                            type="text"
                            value={config.repo}
                            onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                            placeholder="E2E-client-management"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>ブランチ</label>
                    <input
                        type="text"
                        value={config.branch}
                        onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                        placeholder="main"
                    />
                </div>

                <div className="flex gap-3" style={{ marginTop: 'var(--space-6)' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? '保存中...' : '💾 設定を保存'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleTest}>
                        🔗 接続テスト
                    </button>
                </div>

                {testResult && (
                    <div
                        className={testResult.success ? 'success-banner' : 'error-banner'}
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        {testResult.success ? '✅' : '❌'} {testResult.message}
                    </div>
                )}
            </div>

            {/* サンプルデータ投入 */}
            <div className="card" style={{ maxWidth: '640px' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    🗂️ サンプルデータ
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                    初回利用時にサンプルデータを投入して動作を確認できます。
                    既存データがある場合は上書きされますのでご注意ください。
                </p>
                <button className="btn btn-secondary" onClick={handleSeedData} disabled={seeding}>
                    {seeding ? (
                        <><span className="spinner"></span> 投入中...</>
                    ) : (
                        '📥 サンプルデータを投入'
                    )}
                </button>
                {seedResult && (
                    <div className={seedResult.startsWith('エラー') ? 'error-banner' : 'success-banner'} style={{ marginTop: 'var(--space-4)' }}>
                        {seedResult}
                    </div>
                )}
            </div>

            {/* Token発行手順 */}
            <div className="card" style={{ maxWidth: '640px', marginTop: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    📖 Token 発行手順
                </h2>
                <ol style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <li>
                        GitHub にログインし、右上の<strong>自分のアイコン</strong>をクリック → <strong>Settings</strong> をクリック
                        <br />
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            ※ リポジトリの Settings ではなく、<strong>アカウントの Settings</strong> です
                        </span>
                    </li>
                    <li>
                        左メニューを一番下までスクロールし、<strong>Developer settings</strong> をクリック
                        <br />
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            ※ 左サイドバーの最下部にあります
                        </span>
                    </li>
                    <li><strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong> を選択</li>
                    <li><strong>Generate new token (classic)</strong> をクリック</li>
                    <li>
                        Note に任意の名前を入力（例: CRM-App）
                        <br />
                        Expiration を設定（推奨: 90 days）
                    </li>
                    <li>
                        Scopes で <strong>repo</strong> にチェック
                    </li>
                    <li><strong>Generate token</strong> をクリックし、表示されたトークンをコピー</li>
                    <li>上記設定欄にトークンを貼り付けて保存</li>
                </ol>
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
                    💡 直接アクセス: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)' }}>
                        https://github.com/settings/tokens/new
                    </a>
                </div>
            </div>
        </div>
    );
}
