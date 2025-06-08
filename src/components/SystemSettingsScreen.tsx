'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from './SettingsScreen.module.css';

export default function SystemSettingsScreen() {
  const router = useRouter();
  const {
    bgmEnabled,
    bgmVolume,
    soundEffectsEnabled,
    soundEffectsVolume,
    hitSoundEnabled,
    hitSoundVolume,
    showKeyboard,
    showKanaDisplay,
    setBgmEnabled,
    setBgmVolume,
    setSoundEffectsEnabled,
    setSoundEffectsVolume,
    setHitSoundEnabled,
    setHitSoundVolume,
    setShowKeyboard,
    setShowKanaDisplay,
  } = useSettingsStore();  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Toggle クリックハンドラー
  const handleToggleClick = (setter: (value: boolean) => void, currentValue: boolean) => {
    setter(!currentValue);
  };

  // ESCキーでの戻る機能を追加
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        e.preventDefault();
        handleBack();
      },
    },
  ], [handleBack]);
  return (
    // system.html完全再現: フルスクリーンレイアウト
    <div className={styles.systemFullscreen}>
      <main className={styles.system}>
        <h1 className={styles.system__title}>System Settings</h1>

        {/* BGM設定 */}
        <section className={styles.system__item}>
          <div className={styles.system__row}>
            <label className={styles.system__label}>BGM</label>
            <div className={styles.system__controls}>
              <div 
                className={`${styles.system__toggle} ${bgmEnabled ? styles['system__toggle--on'] : ''}`}
                role="switch"
                aria-checked={bgmEnabled}
                onClick={() => handleToggleClick(setBgmEnabled, bgmEnabled)}
              />
              <input 
                type="range" 
                className={styles.system__slider} 
                min="0" 
                max="10" 
                value={bgmVolume}
                onChange={(e) => setBgmVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Sound Effects設定 */}
        <section className={styles.system__item}>
          <div className={styles.system__row}>
            <label className={styles.system__label}>Sound Effects</label>
            <div className={styles.system__controls}>
              <div 
                className={`${styles.system__toggle} ${soundEffectsEnabled ? styles['system__toggle--on'] : ''}`}
                role="switch"
                aria-checked={soundEffectsEnabled}
                onClick={() => handleToggleClick(setSoundEffectsEnabled, soundEffectsEnabled)}
              />
              <input 
                type="range" 
                className={styles.system__slider} 
                min="0" 
                max="10" 
                value={soundEffectsVolume}
                onChange={(e) => setSoundEffectsVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Hit Sound設定 */}
        <section className={styles.system__item}>
          <div className={styles.system__row}>
            <label className={styles.system__label}>Hit Sound</label>
            <div className={styles.system__controls}>
              <div 
                className={`${styles.system__toggle} ${hitSoundEnabled ? styles['system__toggle--on'] : ''}`}
                role="switch"
                aria-checked={hitSoundEnabled}
                onClick={() => handleToggleClick(setHitSoundEnabled, hitSoundEnabled)}
              />
              <input 
                type="range" 
                className={styles.system__slider} 
                min="0" 
                max="10" 
                value={hitSoundVolume}
                onChange={(e) => setHitSoundVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Show Keyboard設定 */}
        <section className={styles.system__item}>
          <div className={styles.system__row}>
            <label className={styles.system__label}>Show Keyboard</label>
            <div className={styles.system__controls}>
              <div 
                className={`${styles.system__toggle} ${showKeyboard ? styles['system__toggle--on'] : ''}`}
                role="switch"
                aria-checked={showKeyboard}
                onClick={() => handleToggleClick(setShowKeyboard, showKeyboard)}
              />
            </div>
          </div>
        </section>

        {/* Kana Display設定 */}
        <section className={styles.system__item}>
          <div className={styles.system__row}>
            <label className={styles.system__label}>Kana Display</label>
            <div className={styles.system__controls}>
              <div 
                className={`${styles.system__toggle} ${showKanaDisplay ? styles['system__toggle--on'] : ''}`}
                role="switch"
                aria-checked={showKanaDisplay}
                onClick={() => handleToggleClick(setShowKanaDisplay, showKanaDisplay)}
              />
            </div>
          </div>
        </section>        {/* ボタンエリア */}
        <nav className={styles.system__buttons}>
          <button className={styles.button} onClick={handleBack}>
            Back
          </button>
        </nav>
      </main>
    </div>
  );
}
