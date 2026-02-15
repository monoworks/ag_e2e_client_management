// ==========================================
// ファイルドロップゾーン (D&D テキストファイルアップロード)
// ==========================================

import { useState, useRef, DragEvent } from 'react';

interface FileDropZoneProps {
    onFileLoad: (fileName: string, content: string) => void;
    disabled?: boolean;
}

export default function FileDropZone({ onFileLoad, disabled }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        setError(null);

        if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
            setError('テキストファイル (.txt) のみアップロードできます。');
            return;
        }

        if (file.size > 500 * 1024) {
            setError('ファイルサイズは500KB以下にしてください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onFileLoad(file.name, content);
        };
        reader.onerror = () => {
            setError('ファイルの読み込みに失敗しました。');
        };
        reader.readAsText(file, 'UTF-8');
    };

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const onClickSelect = () => {
        inputRef.current?.click();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
        e.target.value = '';
    };

    return (
        <div>
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={onClickSelect}
                style={{
                    border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-8)',
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: isDragging ? 'var(--color-accent-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)', opacity: 0.6 }}>📄</div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    テキストファイル (.txt) をドラッグ&ドロップ
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}>
                    またはクリックして選択（最大500KB）
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".txt,text/plain"
                    onChange={onInputChange}
                    style={{ display: 'none' }}
                />
            </div>
            {error && (
                <div className="error-banner" style={{ marginTop: 'var(--space-3)' }}>
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
