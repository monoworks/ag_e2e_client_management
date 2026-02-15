// ==========================================
// ステータスバッジ
// ==========================================

import { ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../types';

interface StatusBadgeProps {
    status: ProjectStatus;
    size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const color = PROJECT_STATUS_COLORS[status];
    const label = PROJECT_STATUS_LABELS[status];

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: size === 'sm' ? '2px 8px' : '4px 12px',
                fontSize: size === 'sm' ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                fontWeight: 600,
                color: color,
                background: `${color}20`,
                border: `1px solid ${color}40`,
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: size === 'sm' ? 6 : 8,
                    height: size === 'sm' ? 6 : 8,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                }}
            />
            {label}
        </span>
    );
}
