// ==========================================
// 案件一覧画面
// ==========================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getGitHubConfig } from '../utils/github';
import {
    ProjectStatus,
    PROJECT_STATUS_LABELS,
} from '../types';
import type { Project } from '../types';

type FormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

const STATUS_ORDER: ProjectStatus[] = ['prospect', 'proposal', 'negotiation', 'won', 'lost', 'deepening'];

const emptyForm: FormData = {
    clientId: '',
    title: '',
    description: '',
    status: 'prospect',
    amount: 0,
    startDate: '',
    endDate: '',
};

export default function ProjectList() {
    const { state, refreshData, addProject } = useApp();
    const { clients, projects } = state.data;
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const config = getGitHubConfig();

    useEffect(() => {
        if (config && !state.initialized && !state.loading) {
            refreshData();
        }
    }, [config, state.initialized, state.loading, refreshData]);

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return projects;
        return projects.filter((p) => p.status === statusFilter);
    }, [projects, statusFilter]);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.clientId) return;
        setSaving(true);
        try {
            await addProject(form);
            setForm(emptyForm);
            setIsModalOpen(false);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
        setSaving(false);
    };

    if (!config) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>💼 案件管理</h1></div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        先に<Link to="/settings">設定画面</Link>でGitHub Tokenを設定してください。
                    </p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>読み込み中...</p></div>;
    }

    // ステータス別集計
    const statusSummary = STATUS_ORDER.map((status) => ({
        status,
        count: projects.filter((p) => p.status === status).length,
    }));

    return (
        <div className="animate-fadeIn">
            <div className="page-header page-header-actions">
                <div>
                    <h1>💼 案件管理</h1>
                    <p>案件一覧とステータス管理</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    ＋ 新規案件
                </button>
            </div>

            {state.error && <div className="error-banner">⚠️ {state.error}</div>}

            {/* ステータスフィルタ */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                <button
                    className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setStatusFilter('all')}
                >
                    すべて ({projects.length})
                </button>
                {statusSummary.map(({ status, count }) => (
                    <button
                        key={status}
                        className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {PROJECT_STATUS_LABELS[status]} ({count})
                    </button>
                ))}
            </div>

            {/* 案件一覧 */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">💼</div>
                    <p>案件がありません</p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        最初の案件を登録
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                    {filtered.map((project, idx) => {
                        const client = clients.find((c) => c.id === project.clientId);
                        return (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${idx * 50}ms` }}
                                className="animate-fadeIn"
                            >
                                <div className="card card-clickable">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                                        <StatusBadge status={project.status} />
                                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                            ¥{project.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                                        {project.title}
                                    </div>
                                    {client && (
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                                            🏢 {client.companyName}
                                        </div>
                                    )}
                                    {project.description && (
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--space-3)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {project.description}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--space-3)' }}>
                                        {project.startDate && <span>📅 {project.startDate}</span>}
                                        {project.endDate && <span>→ {project.endDate}</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 新規案件モーダル */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新規案件登録">
                <div className="form-group">
                    <label>案件名 *</label>
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="例: DX推進コンサルティング"
                    />
                </div>
                <div className="form-group">
                    <label>顧客 *</label>
                    <select
                        value={form.clientId}
                        onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    >
                        <option value="">— 顧客を選択 —</option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>説明</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="案件の概要..."
                        rows={3}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>ステータス</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                        >
                            {STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>見込金額 (円)</label>
                        <input
                            type="number"
                            value={form.amount || ''}
                            onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                            placeholder="5000000"
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>開始日</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>終了日</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.clientId}>
                        {saving ? '保存中...' : '登録'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
