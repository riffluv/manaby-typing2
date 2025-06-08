import React, { useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import styles from './SettingsScreen.module.css';

const SettingsScreen: React.FC = React.memo(() => {
  const { goBack, goToMenu } = useSceneNavigationStore();
  // 音響・表示設定ストア
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
  } = useSettingsStore();

  // 設定変更ハンドラーをメモ化
  const handleBgmToggle = useCallback(() => setBgmEnabled(!bgmEnabled), [bgmEnabled, setBgmEnabled]);
  const handleBgmVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setBgmVolume(Number(e.target.value)), [setBgmVolume]);
  const handleSoundEffectsToggle = useCallback(() => 
    setSoundEffectsEnabled(!soundEffectsEnabled), [soundEffectsEnabled, setSoundEffectsEnabled]);
  const handleSoundEffectsVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setSoundEffectsVolume(Number(e.target.value)), [setSoundEffectsVolume]);
  const handleHitSoundToggle = useCallback(() => 
    setHitSoundEnabled(!hitSoundEnabled), [hitSoundEnabled, setHitSoundEnabled]);
  const handleHitSoundVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setHitSoundVolume(Number(e.target.value)), [setHitSoundVolume]);
  const handleKeyboardToggle = useCallback(() => 
    setShowKeyboard(!showKeyboard), [showKeyboard, setShowKeyboard]);
  const handleKanaDisplayToggle = useCallback(() => 
    setShowKanaDisplay(!showKanaDisplay), [showKanaDisplay, setShowKanaDisplay]);

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
                onClick={handleBgmToggle}
              />
              <input
                type="range"
                className={styles.system__slider}
                min="0"
                max="10"
                value={bgmVolume}
                onChange={handleBgmVolumeChange}
                disabled={!bgmEnabled}
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
                onClick={handleSoundEffectsToggle}
              />
              <input
                type="range"
                className={styles.system__slider}
                min="0"
                max="10"
                value={soundEffectsVolume}
                onChange={handleSoundEffectsVolumeChange}
                disabled={!soundEffectsEnabled}
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
                onClick={handleHitSoundToggle}
              />
              <input
                type="range"
                className={styles.system__slider}
                min="0"
                max="10"
                value={hitSoundVolume}
                onChange={handleHitSoundVolumeChange}
                disabled={!hitSoundEnabled}
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
                onClick={handleKeyboardToggle}
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
                onClick={handleKanaDisplayToggle}
              />
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <nav className={styles.system__buttons}>
          <button className={styles.system__button} onClick={goBack}>
            Back
          </button>
          <button className={styles.system__button} onClick={goToMenu}>
            Main Menu
          </button>
        </nav>
      </main>
    </div>
  );
});

SettingsScreen.displayName = 'SettingsScreen';

export default SettingsScreen;
