'use client';

export const runtime = 'edge';

import { fetchTeams, createTeam, updateTeam, deleteTeam } from '@/lib/dataManager';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeamEditPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const isNew = teamId === 'new';

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        shortName: '',
        color: '#FF0000',
        description: ''
    });

    useEffect(() => {
        async function loadData() {
            try {
                if (!isNew) {
                    const teams = await fetchTeams();
                    const team = teams.find(t => t.id === teamId);
                    if (team) {
                        setFormData(team);
                    }
                }
            } catch (err) {
                console.error('Failed to load team:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, isNew]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isNew) {
                // 新規追加
                // チーム名からIDを生成
                const id = form Data.name
                    .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const newTeam = {
        id,
        name: formData.name,
        shortName: formData.shortName,
        color: formData.color,
        description: formData.description
    };
    await createTeam(newTeam);
    alert('チームを追加しました！');
    router.push('/admin');
} else {
    // 更新
    await updateTeam(teamId, formData);
    alert('チームを更新しました！');
    router.push('/admin');
}
        } catch (error) {
    console.error('Failed to save team:', error);
    alert('保存に失敗しました');
}
    };

const handleDelete = async () => {
    if (!confirm('本当にこのチームを削除しますか？')) return;

    try {
        await deleteTeam(teamId);
        alert('チームを削除しました！');
        router.push('/admin');
    } catch (error) {
        console.error('Failed to delete team:', error);
        alert('削除に失敗しました');
    }
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
