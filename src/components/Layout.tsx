// ==========================================
// Layout - サイドバー + メインコンテンツ
// ==========================================

import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">📊</div>
                        <div>
                            <h1>CRM</h1>
                            <span className="subtitle">案件管理システム</span>
                        </div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">メニュー</div>
                        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">🏠</span>
                            ダッシュボード
                        </NavLink>
                        <NavLink to="/clients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">👥</span>
                            顧客管理
                        </NavLink>
                        <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">💼</span>
                            案件管理
                        </NavLink>
                    </div>
                    <div className="nav-section">
                        <div className="nav-section-title">システム</div>
                        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">⚙️</span>
                            設定
                        </NavLink>
                    </div>
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
