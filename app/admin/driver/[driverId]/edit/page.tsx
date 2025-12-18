'use client';

export const runtime = 'edge';

import { getData, saveData } from '@/lib/dataManager';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DriverEditPage() {
    const params = useParams();
    const router = useRouter();
    const driverId = params.driverId as string;
    const isNew = driverId === 'new';

    const [data, setData] = useState(getData());
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        number: 1,
        teamId: '',
        nationality: 'JPN',
        bio: '',
        photoUrl: ''
    });

    useEffect(() => {
        if (!isNew) {
            const currentData = getData();
            const driver = currentData.drivers.find(d => d.id === driverId);
            if (driver) {
                setFormData({
                    ...driver,
                    photoUrl: driver.photoUrl || ''
                });
            }
        }
    }, [driverId, isNew]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // ファイルをBase64に変換
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    // R2にアップロード
                    const response = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image: reader.result,
                            fileName: file.name,
                        }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || '画像のアップロードに失敗しました');
                    }

                    const responseData = await response.json();

                    // R2から返されたURLをセット
                    setFormData(prev => ({ ...prev, photoUrl: responseData.url }));
                    alert('画像をアップロードしました！');
                } catch (error) {
                    console.error('Upload error:', error);
                    alert(error instanceof Error ? error.message : '画像のアップロードに失敗しました。もう一度お試しください。');
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('File read error:', error);
            alert('画像の読み込みに失敗しました');
            setIsUploading(false);
        }
    };

    const handleDeletePhoto = () => {
        setFormData({ ...formData, photoUrl: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentData = getData();

        if (isNew) {
            // 新規追加
            const newDriver = {
                ...formData,
                id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
                number: Number(formData.number)
            };
            currentData.drivers.push(newDriver);
        } else {
            // 編集
            const index = currentData.drivers.findIndex(d => d.id === driverId);
            if (index !== -1) {
                const oldTeamId = currentData.drivers[index].teamId;
                const newTeamId = formData.teamId;

                currentData.drivers[index] = {
                    ...formData,
                    number: Number(formData.number)
                };

                // チーム変更があった場合、全レース結果のteamIdを更新
                if (oldTeamId !== newTeamId) {
                    currentData.races.forEach(race => {
                        race.sessions.forEach(session => {
                            session.results.forEach(result => {
                                if (result.driverId === driverId) {
                                    result.teamId = newTeamId;
                                }
                            });
                        });
                    });
                }
            }
        }

        saveData(currentData);
        alert(isNew ? 'ドライバーを追加しました！' : 'ドライバーを更新しました！');
        router.push('/admin');
    };

    const handleDelete = () => {
        if (!confirm('本当にこのドライバーを削除しますか？')) return;

        const currentData = getData();
        currentData.drivers = currentData.drivers.filter(d => d.id !== driverId);
        saveData(currentData);
        alert('ドライバーを削除しました！');
        router.push('/admin');
    };

    return (
        <div className="container">
            <h1>{isNew ? '新規ドライバー追加' : 'ドライバー編集'}</h1>

            <form onSubmit={handleSubmit} className={styles.editForm}>
                <div className={`${styles.formSection} racing-card`}>
                    <h2>ドライバー情報</h2>

                    <div className={styles.formGroup}>
                        <label>ドライバーID {isNew && <span className={styles.required}>*</span>}</label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            placeholder="例: chiffon-inugasaki"
                            disabled={!isNew}
                            required={isNew}
                        />
                        <small>英数字とハイフンのみ（編集後は変更不可）</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>名前 <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="例: Chiffon Inugasaki"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>カーナンバー <span className={styles.required}>*</span></label>
                        <input
                            type="number"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                            min="1"
                            max="99"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>チーム <span className={styles.required}>*</span></label>
                        <select
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            required
                        >
                            <option value="">チームを選択してください</option>
                            {data.teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>国籍</label>
                        <input
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            placeholder="例: JPN"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>プロフィール</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="ドライバーのプロフィールを入力してください"
                            rows={4}
                        />
                    </div>
                </div>

                {/* 写真アップロード */}
                <div className={`${styles.formSection} racing-card`}>
                    <h2>ドライバー写真</h2>
                    <div className={styles.photoUploadSection}>
                        {formData.photoUrl ? (
                            <div className={styles.photoPreview}>
                                <div>
                                    <img src={formData.photoUrl} alt="Driver photo" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDeletePhoto}
                                    className="btn-secondary"
                                >
                                    写真を削除
                                </button>
                            </div>
                        ) : (
                            <div className={styles.photoPlaceholder}>
                                <span>👤</span>
                                <p>写真がアップロードされていません</p>
                            </div>
                        )}
                        <div className={styles.photoUploadControl}>
                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                disabled={isUploading}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="photo-upload"
                                className={`btn-racing ${isUploading ? styles.uploading : ''}`}
                                style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                            >
                                {isUploading ? 'アップロード中...' : '写真を選択'}
                            </label>
                            <small>推奨サイズ: 縦長の写真（3:4の比率）</small>
                        </div>
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button type="submit" className="btn-racing" disabled={isUploading}>
                        {isNew ? '追加' : '更新'}
                    </button>
                    <Link href="/admin" className="btn-secondary">
                        キャンセル
                    </Link>
                    {!isNew && (
                        <button type="button" onClick={handleDelete} className="btn-danger">
                            削除
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
