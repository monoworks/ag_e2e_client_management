// ==========================================
// ダッシュボード
// ==========================================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ACTIVITY_TYPE_ICONS } from '../types';
import { getGitHubConfig } from '../utils/github';

const STATUS_ORDER: ProjectStatus[] = ['prospect', 'proposal', 'negotiation', 'won', 'lost', 'deepening'];

export default function Dashboard() {
    const { state, refreshData } = useApp();
    const { clients, projects, activities } = state.data;
    const config = getGitHubConfig();

    useEffect(() => {
        if (config && !state.initialized && !state.loading) {
            refreshData();
        }
    }, [config, state.initialized, state.loading, refreshData]);

    if (!config) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1>ダッシュボード</h1>
                    <p>コンサル案件管理システム</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚙️</div>
                    <h2 style={{ marginBottom: 'var(--space-3)' }}>初期設定が必要です</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                        GitHub Token を設定してデータの読み書きを有効にしてください。
                    </p>
                    <Link to="/settings" className="btn btn-primary btn-lg">設定画面へ</Link>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner spinner-lg"></div>
                <p>データを読み込み中...</p>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>ダッシュボード</h1></div>
                <div className="error-banner">⚠️ {state.error}</div>
                <button className="btn btn-primary" onClick={refreshData}>再読み込み</button>
            </div>
        );
    }

    // ステータス別集計
    const statusCounts = STATUS_ORDER.map((status) => ({
        status,
        count: projects.filter((p) => p.status === status).length,
        amount: projects.filter((p) => p.status === status).reduce((sum, p) => sum + p.amount, 0),
    }));

    const totalAmount = projects.reduce((sum, p) => sum + p.amount, 0);

    // 直近の活動
    const recentActivities = [...activities]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="animate-fadeIn">
            <div className="page-header page-header-actions">
                <div>
                    <h1>ダッシュボード</h1>
                    <p>コンサル案件の状況を一覧で確認</p>
                </div>
                <button className="btn btn-secondary" onClick={refreshData}>
                    🔄 データ更新
                </button>
            </div>

            {/* サマリーカード */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <div className="card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>総顧客数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{clients.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--color-info)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>総案件数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{projects.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--color-success)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>総見込金額</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>¥{totalAmount.toLocaleString()}</div>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>活動件数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{activities.length}</div>
                </div>
            </div>

            {/* パイプライン */}
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 パイプライン</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {statusCounts.map(({ status, count, amount }) => (
                    <div key={status} className="card" style={{ textAlign: 'center' }}>
                        <StatusBadge status={status} size="sm" />
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 'var(--space-3) 0 var(--space-1)' }}>{count}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            ¥{amount.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* 直近の活動 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📋 直近の活動</h2>
                    {recentActivities.length === 0 ? (
                        <div className="empty-state"><p>活動ログがありません</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {recentActivities.map((a) => {
                                const client = clients.find((c) => c.id === a.clientId);
                                return (
                                    <div key={a.id} className="card" style={{ padding: 'var(--space-4)' }}>
                                        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                                            <span>{ACTIVITY_TYPE_ICONS[a.type]}</span>
                                            <span style={{ fontWeight: 500 }}>{a.title}</span>
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {client?.companyName} • {a.date}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 案件一覧 (上位) */}
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>💰 進行中の案件</h2>
                    {projects.filter((p) => !['won', 'lost'].includes(p.status)).length === 0 ? (
                        <div className="empty-state"><p>進行中の案件はありません</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {projects
                                .filter((p) => !['won', 'lost'].includes(p.status))
                                .sort((a, b) => b.amount - a.amount)
                                .slice(0, 5)
                                .map((p) => {
                                    const client = clients.find((c) => c.id === p.clientId);
                                    return (
                                        <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card card-clickable" style={{ padding: 'var(--space-4)' }}>
                                                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                                                    <span style={{ fontWeight: 500 }}>{p.title}</span>
                                                    <StatusBadge status={p.status} size="sm" />
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    {client?.companyName} • ¥{p.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
