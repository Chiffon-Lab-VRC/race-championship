'use client';

export const runtime = 'edge';

import { getData, saveData } from '@/lib/dataManager';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeamEditPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const isNew = teamId === 'new';

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        shortName: '',
        color: '#E60012',
        description: ''
    });

    useEffect(() => {
        if (!isNew) {
            const data = getData();
            const team = data.teams.find(t => t.id === teamId);
            if (team) {
                setFormData(team);
            }
        }
    }, [teamId, isNew]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = getData();

        if (isNew) {
            // 新規追加
            const newTeam = {
                ...formData,
                id: formData.id || formData.shortName.toLowerCase().replace(/\s+/g, '-')
            };
            data.teams.push(newTeam);
        } else {
            // 編集
            const index = data.teams.findIndex(t => t.id === teamId);
            if (index !== -1) {
                data.teams[index] = { ...formData };
            }
        }

        saveData(data);
        alert(isNew ? 'チームを追加しました！' : 'チームを更新しました！');
        router.push('/admin');
    };

    const handleDelete = () => {
        if (!confirm('本当にこのチームを削除しますか？')) return;

        const data = getData();
        data.teams = data.teams.filter(t => t.id !== teamId);
        saveData(data);
        alert('チームを削除しました！');
        router.push('/admin');
    };

    return (
        <div className="container">
            <h1>{isNew ? '新規チーム追加' : 'チーム編集'}</h1>

            <form onSubmit={handleSubmit} className={styles.editForm}>
                <div className={`${styles.formSection} racing-card`}>
                    <h2>チーム情報</h2>

                    <div className={styles.formGroup}>
                        <label>チームID {isNew && <span className={styles.required}>*</span>}</label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            placeholder="例: kci-racing"
                            disabled={!isNew}
                            required={isNew}
                        />
                        <small>英数字とハイフンのみ（編集後は変更不可）</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>チーム名 <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="例: KCI Racing RBPT Honda"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>略称 <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            value={formData.shortName}
                            onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                            placeholder="例: KCI Racing"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>チームカラー <span className={styles.required}>*</span></label>
                        <div className={styles.colorInputGroup}>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className={styles.colorPicker}
                                required
                            />
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="#E60012"
                                className={styles.colorInput}
                            />
                            <div
                                className={styles.colorPreview}
                                style={{ backgroundColor: formData.color }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>説明</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="チームの説明を入力..."
                            rows={4}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className="btn-racing">
                        {isNew ? '追加' : '更新'}
                    </button>
                    {!isNew && (
                        <button type="button" onClick={handleDelete} className="btn-secondary">
                            削除
                        </button>
                    )}
                    <Link href="/admin" className="btn-secondary">
                        キャンセル
                    </Link>
                </div>
            </form>
        </div>
    );
}
