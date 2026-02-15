// ==========================================
// 顧客詳細画面
// ==========================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FileDropZone from '../components/FileDropZone';
import { getGitHubConfig } from '../utils/github';
import {
    ACTIVITY_TYPE_LABELS,
    ACTIVITY_TYPE_ICONS,
    ActivityType,
} from '../types';
import type { Activity, MeetingNote } from '../types';

type ActivityForm = Omit<Activity, 'id' | 'createdAt'>;
type Tab = 'projects' | 'activities' | 'notes';

export default function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        state,
        refreshData,
        updateClient,
        deleteClient,
        addActivity,
        addMeetingNote,
    } = useApp();
    const { clients, projects, activities, meetingNotes } = state.data;
    const config = getGitHubConfig();

    const [activeTab, setActiveTab] = useState<Tab>('projects');
    const [isEditing, setIsEditing] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);
    const clientProjects = useMemo(() => projects.filter((p) => p.clientId === id), [projects, id]);
    const clientActivities = useMemo(
        () =>
            [...activities.filter((a) => a.clientId === id)].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        [activities, id]
    );
    const clientNotes = useMemo(
        () =>
            [...meetingNotes.filter((n) => n.clientId === id)].sort(
                (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            ),
        [meetingNotes, id]
    );

    // 編集用フォーム
    const [editForm, setEditForm] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    // 活動追加フォーム
    const [activityForm, setActivityForm] = useState<ActivityForm>({
        projectId: '',
        clientId: id || '',
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
        if (client) {
            setEditForm({
                companyName: client.companyName,
                contactPerson: client.contactPerson,
                email: client.email,
                phone: client.phone,
                address: client.address,
                notes: client.notes,
            });
        }
    }, [client]);

    if (!config) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>顧客詳細</h1></div>
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

    if (!client) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header"><h1>顧客が見つかりません</h1></div>
                <Link to="/clients" className="btn btn-secondary">← 顧客一覧に戻る</Link>
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateClient({ ...client, ...editForm });
            setIsEditing(false);
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirm(`「${client.companyName}」を削除しますか？\n関連する案件・活動ログも確認してください。`)) return;
        try {
            await deleteClient(client.id);
            navigate('/clients');
        } catch (err) {
            alert(`エラー: ${(err as Error).message}`);
        }
    };

    const handleAddActivity = async () => {
        if (!activityForm.title.trim()) return;
        setSaving(true);
        try {
            await addActivity({ ...activityForm, clientId: client.id });
            setActivityForm({
                projectId: '',
                clientId: client.id,
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
            projectId: clientProjects[0]?.id || '',
            clientId: client.id,
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
                    <Link to="/clients" className="btn btn-ghost" style={{ fontSize: '1.2rem' }}>←</Link>
                    <div>
                        <h1>{client.companyName}</h1>
                        <p>{client.contactPerson}</p>
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

            {/* 顧客情報カード */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                {isEditing ? (
                    <div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>会社名</label>
                                <input value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>担当者名</label>
                                <input value={editForm.contactPerson} onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>メール</label>
                                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>電話番号</label>
                                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>住所</label>
                            <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>備考</label>
                            <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>メール</div>
                            <div>{client.email || '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>電話番号</div>
                            <div>{client.phone || '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>住所</div>
                            <div>{client.address || '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>備考</div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{client.notes || '—'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* サマリーカード */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-info)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>案件数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{clientProjects.length}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-success)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>活動数</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{clientActivities.length}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', borderLeft: '3px solid var(--color-warning)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>見込合計</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                        ¥{clientProjects.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* タブ */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
                <button style={tabStyle('projects')} onClick={() => setActiveTab('projects')}>
                    💼 案件 ({clientProjects.length})
                </button>
                <button style={tabStyle('activities')} onClick={() => setActiveTab('activities')}>
                    📋 活動履歴 ({clientActivities.length})
                </button>
                <button style={tabStyle('notes')} onClick={() => setActiveTab('notes')}>
                    📄 議事メモ ({clientNotes.length})
                </button>
            </div>

            {/* 案件タブ */}
            {activeTab === 'projects' && (
                <div>
                    {clientProjects.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">💼</div>
                            <p>関連する案件がありません</p>
                            <Link to="/projects" className="btn btn-primary">案件を追加</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {clientProjects.map((p) => (
                                <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card card-clickable" style={{ padding: 'var(--space-4)' }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                                            <span style={{ fontWeight: 600 }}>{p.title}</span>
                                            <StatusBadge status={p.status} size="sm" />
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            ¥{p.amount.toLocaleString()} • {p.startDate} 〜 {p.endDate}
                                        </div>
                                        {p.description && (
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                                                {p.description}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
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
                    {clientActivities.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📋</div>
                            <p>活動履歴がありません</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: 'var(--space-8)' }}>
                            {/* タイムライン線 */}
                            <div style={{
                                position: 'absolute',
                                left: 11,
                                top: 8,
                                bottom: 8,
                                width: 2,
                                background: 'var(--color-border)',
                            }} />
                            {clientActivities.map((a) => {
                                const project = projects.find((p) => p.id === a.projectId);
                                return (
                                    <div key={a.id} style={{ position: 'relative', marginBottom: 'var(--space-5)' }}>
                                        {/* タイムラインドット */}
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
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', whiteSpace: 'pre-wrap' }}>
                                                    {a.description}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                📅 {a.date}
                                                {project && <> • 💼 {project.title}</>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
                    {clientNotes.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📄</div>
                            <p>議事メモがありません</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {clientNotes.map((note) => (
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
                        placeholder="例: 初回ヒアリング"
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
                {clientProjects.length > 0 && (
                    <div className="form-group">
                        <label>関連案件</label>
                        <select
                            value={activityForm.projectId}
                            onChange={(e) => setActivityForm({ ...activityForm, projectId: e.target.value })}
                        >
                            <option value="">— 選択なし —</option>
                            {clientProjects.map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                )}
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
