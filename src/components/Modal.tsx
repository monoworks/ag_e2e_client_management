// ==========================================
// 汎用モーダル
// ==========================================

import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = '560px' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--space-4)',
                animation: 'fadeIn 0.2s ease',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--color-bg-modal)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    width: '100%',
                    maxWidth: width,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    animation: 'scaleIn 0.2s ease',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-5) var(--space-6)',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ fontSize: '1.2rem', padding: '4px 8px' }}
                    >
                        ✕
                    </button>
                </div>
                <div style={{ padding: 'var(--space-6)' }}>{children}</div>
            </div>
        </div>
    );
}
