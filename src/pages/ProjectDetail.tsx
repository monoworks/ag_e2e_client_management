// ==========================================
// 案件詳細画面
// ==========================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FileDropZone from '../components/FileDropZone';
import { getGitHubConfig } from '../utils/github';
import {
    ProjectStatus,
    PROJECT_STATUS_LABELS,
    ACTIVITY_TYPE_LABELS,
    ACTIVITY_TYPE_ICONS,
    ActivityType,
} from '../types';
import type { Activity, MeetingNote } from '../types';

const STATUS_ORDER: ProjectStatus[] = ['prospect', 'proposal', 'negotiation', 'won', 'lost', 'deepening'];
type Tab = 'details' | 'activities' | 'notes';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        state,
        refreshData,
        updateProject,
        updateProjectStatus,
        deleteProject,
        addActivity,
        addMeetingNote,
    } = useApp();
    const { clients, projects, activities, meetingNotes } = state.data;
    const config = getGitHubConfig();

    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);
    const client = useMemo(() => (project ? clients.find((c) => c.id === project.clientId) : null), [clients, project]);
    const projectActivities = useMemo(
        () =>
            [...activities.filter((a) => a.projectId === id)].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        [activities, id]
    );
    const projectNotes = useMemo(
        () =>
            [...meetingNotes.filter((n) => n.projectId === id)].sort(
                (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            ),
        [meetingNotes, id]
    );

    // 編集フォーム
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        status: 'prospect' as ProjectStatus,
        amount: 0,
        startDate: '',
        endDate: '',
        clientId: '',
    });

    // 活動追加フォーム
    const [activityForm, setActivityForm] = useState<Omit<Activity, 'id' | 'createdAt'>>({
        projectId: id || '',
        clientId: '',
        type: 'meeting',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (config && !state.initialized && !state.loading) {
            refreshData();
        }
    }, [config, state.initialized, state.loading, refreshData]);

    useEffect(() => {
        if (project) {
            setEditForm({
                title: project.title,
                description: project.description,
                status: project.status,
                amount: project.amount,
                startDate: project.startDate,
                endDate: project.endDate,
                clientId: project.clientId,
            });
            setActivityForm((prev) => ({
                ...prev,
                projectId: project.id,
                clientId: project.clientId,
            }));
        }
    }, [project]);

    if (!config) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>案件詳細</h1></div>
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

    if (!project) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>案件が見つかりません</h1></div>
                <Link to="/projects" className="btn btn-secondary">← 案件一覧に戻る</Link>
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProject({ ...project, ...editForm });
            setIsEditing(false);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
        setSaving(false);
    };

    const handleStatusChange = async (status: ProjectStatus) => {
        try {
            await updateProjectStatus(project.id, status);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`「${project.title}」を削除しますか？`)) return;
        try {
            await deleteProject(project.id);
            navigate('/projects');
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
    };

    const handleAddActivity = async () => {
        if (!activityForm.title.trim()) return;
        setSaving(true);
        try {
            await addActivity({
                ...activityForm,
                projectId: project.id,
                clientId: project.clientId,
            });
            setActivityForm({
                projectId: project.id,
                clientId: project.clientId,
                type: 'meeting',
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            setIsActivityModalOpen(false);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
        setSaving(false);
    };

    const handleFileUpload = async (fileName: string, content: string) => {
        const noteData: Omit<MeetingNote, 'id' | 'uploadedAt'> = {
            projectId: project.id,
            clientId: project.clientId,
            fileName,
            content,
        };
        try {
            await addMeetingNote(noteData);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
    };

    const tabStyle = (tab: Tab) => ({
        padding: 'var(--space-3) var(--space-5)',
        border: 'none',
        background: activeTab === tab ? 'var(--color-accent-light)' : 'transparent',
        color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
        cursor: 'pointer',
        fontWeight: activeTab === tab ? 600 : 400,
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family)',
        transition: 'all var(--transition-fast)',
    });

    return (
        <div className="animate-fadeIn">
            {/* ヘッダー */}
            <div className="page-header page-header-actions">
                <div className="flex items-center gap-4">
                    <Link to="/projects" className="btn btn-ghost" style={{ fontSize: '1.2rem' }}>←</Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1>{project.title}</h1>
                            <StatusBadge status={project.status} />
                        </div>
                        {client && (
                            <p>
                                <Link to={`/clients/${client.id}`} style={{ color: 'var(--color-text-secondary)' }}>
                                    🏢 {client.companyName}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>キャンセル</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? '保存中...' : '💾 保存'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>✏️ 編集</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ 削除</button>
                        </>
                    )}
                </div>
            </div>

            {state.error && <div className="error-banner">⚠️ {state.error}</div>}

            {/* ステータス変更ボタン */}
            {!isEditing && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        ステータス変更
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {STATUS_ORDER.map((status) => (
                            <button
                                key={status}
                                className={`btn btn-sm ${project.status === status ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleStatusChange(status)}
                                disabled={project.status === status}
                            >
                                {PROJECT_STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* サマリーカード */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-success)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>見込金額</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>¥{project.amount.toLocaleString()}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-info)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>活動数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{projectActivities.length}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-warning)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>期間</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginTop: 'var(--space-1)' }}>
                        {project.startDate || '—'} 〜 {project.endDate || '—'}
                    </div>
                </div>
            </div>

            {/* タブ */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
                <button style={tabStyle('details')} onClick={() => setActiveTab('details')}>
                    📝 詳細
                </button>
                <button style={tabStyle('activities')} onClick={() => setActiveTab('activities')}>
                    📋 活動履歴 ({projectActivities.length})
                </button>
                <button style={tabStyle('notes')} onClick={() => setActiveTab('notes')}>
                    📄 議事メモ ({projectNotes.length})
                </button>
            </div>

            {/* 詳細タブ */}
            {activeTab === 'details' && (
                <div className="card">
                    {isEditing ? (
                        <div>
                            <div className="form-group">
                                <label>案件名</label>
                                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>説明</label>
                                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ステータス</label>
                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProjectStatus })}>
                                        {STATUS_ORDER.map((s) => (
                                            <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>見込金額 (円)</label>
                                    <input type="number" value={editForm.amount || ''} onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>開始日</label>
                                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>終了日</label>
                                    <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>顧客</label>
                                <select value={editForm.clientId} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.companyName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>説明</div>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.description || '—'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>顧客</div>
                                    <div>
                                        {client ? (
                                            <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
                                        ) : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>開始日</div>
                                    <div>{project.startDate || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>終了日</div>
                                    <div>{project.endDate || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>作成日</div>
                                    <div>{new Date(project.createdAt).toLocaleDateString('ja-JP')}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 活動履歴タブ */}
            {activeTab === 'activities' && (
                <div>
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                        <div></div>
                        <button className="btn btn-primary btn-sm" onClick={() => setIsActivityModalOpen(true)}>
                            ＋ 活動を記録
                        </button>
                    </div>
                    {projectActivities.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📋</div>
                            <p>活動履歴がありません</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: 'var(--space-8)' }}>
                            <div style={{
                                position: 'absolute',
                                left: 11,
                                top: 8,
                                bottom: 8,
                                width: 2,
                                background: 'var(--color-border)',
                            }} />
                            {projectActivities.map((a) => (
                                <div key={a.id} style={{ position: 'relative', marginBottom: 'var(--space-5)' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: -27,
                                        top: 6,
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: 'var(--color-accent)',
                                        border: '2px solid var(--color-bg-primary)',
                                    }} />
                                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                                        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                                            <span>{ACTIVITY_TYPE_ICONS[a.type]}</span>
                                            <span style={{ fontWeight: 500 }}>{a.title}</span>
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                background: 'var(--color-bg-tertiary)',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                color: 'var(--color-text-muted)',
                                            }}>
                                                {ACTIVITY_TYPE_LABELS[a.type]}
                                            </span>
                                        </div>
                                        {a.description && (
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 'var(--space-2)' }}>
                                                {a.description}
                                            </div>
                                        )}
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            📅 {a.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 議事メモタブ */}
            {activeTab === 'notes' && (
                <div>
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <FileDropZone onFileLoad={handleFileUpload} />
                    </div>
                    {projectNotes.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📄</div>
                            <p>議事メモがありません</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {projectNotes.map((note) => (
                                <div key={note.id} className="card">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                                        <div className="flex items-center gap-3">
                                            <span>📄</span>
                                            <span style={{ fontWeight: 500 }}>{note.fileName}</span>
                                        </div>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {new Date(note.uploadedAt).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                    <div style={{
                                        background: 'var(--color-bg-tertiary)',
                                        padding: 'var(--space-4)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-sm)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.8,
                                        maxHeight: '300px',
                                        overflow: 'auto',
                                    }}>
                                        {note.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 活動追加モーダル */}
            <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="活動を記録">
                <div className="form-group">
                    <label>タイトル *</label>
                    <input
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        placeholder="例: 提案書レビュー"
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>種別</label>
                        <select
                            value={activityForm.type}
                            onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                        >
                            {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>日付</label>
                        <input
                            type="date"
                            value={activityForm.date}
                            onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>内容</label>
                    <textarea
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        placeholder="活動の内容を入力..."
                        rows={4}
                    />
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    <button className="btn btn-secondary" onClick={() => setIsActivityModalOpen(false)}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleAddActivity} disabled={saving || !activityForm.title.trim()}>
                        {saving ? '保存中...' : '記録'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
