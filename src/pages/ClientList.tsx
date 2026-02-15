// ==========================================
// 顧客一覧
// ==========================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { getGitHubConfig } from '../utils/github';
import type { Client } from '../types';

type FormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

const emptyForm: FormData = {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
};

export default function ClientList() {
    const { state, refreshData, addClient } = useApp();
    const { clients, projects } = state.data;
    const [search, setSearch] = useState('');
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
        if (!search.trim()) return clients;
        const q = search.toLowerCase();
        return clients.filter(
            (c) =>
                c.companyName.toLowerCase().includes(q) ||
                c.contactPerson.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
        );
    }, [clients, search]);

    const handleSubmit = async () => {
        if (!form.companyName.trim()) return;
        setSaving(true);
        try {
            await addClient(form);
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
                <div className="page-header"><h1>👥 顧客管理</h1></div>
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

    return (
        <div className="animate-fadeIn">
            <div className="page-header page-header-actions">
                <div>
                    <h1>👥 顧客管理</h1>
                    <p>顧客情報の一覧・登録</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    ＋ 新規顧客
                </button>
            </div>

            {state.error && <div className="error-banner">⚠️ {state.error}</div>}

            {/* 検索バー */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <input
                    type="text"
                    placeholder="🔍 会社名・担当者名・メールで検索..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* 顧客一覧 */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">👥</div>
                    <p>顧客が登録されていません</p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        最初の顧客を登録
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    {filtered.map((client, idx) => {
                        const projectCount = projects.filter((p) => p.clientId === client.id).length;
                        return (
                            <Link key={client.id} to={`/clients/${client.id}`} style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${idx * 50}ms` }} className="animate-fadeIn">
                                <div className="card card-clickable">
                                    <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                            background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: 'var(--font-size-lg)', flexShrink: 0,
                                        }}>
                                            {client.companyName.charAt(0)}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{client.companyName}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                {client.contactPerson}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                        {client.email && <span>✉️ {client.email}</span>}
                                        {client.phone && <span>📞 {client.phone}</span>}
                                    </div>
                                    <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        案件: {projectCount}件
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 新規顧客モーダル */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新規顧客登録">
                <div className="form-group">
                    <label>会社名 *</label>
                    <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="例: 株式会社サンプル" />
                </div>
                <div className="form-group">
                    <label>担当者名</label>
                    <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="例: 田中 太郎" />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>メールアドレス</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@company.co.jp" />
                    </div>
                    <div className="form-group">
                        <label>電話番号</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03-1234-5678" />
                    </div>
                </div>
                <div className="form-group">
                    <label>住所</label>
                    <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="東京都..." />
                </div>
                <div className="form-group">
                    <label>備考</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="メモ..." rows={3} />
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.companyName.trim()}>
                        {saving ? '保存中...' : '登録'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
