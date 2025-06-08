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
    setHitSoundVolume,    setShowKeyboard,
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
    setHitSoundEnabled(!hitSoundEnabled), [hitSoundEnabled, setHitSoundEnabled]);  const handleHitSoundVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setHitSoundVolume(Number(e.target.value)), [setHitSoundVolume]);
  const handleKeyboardToggle = useCallback(() => 
    setShowKeyboard(!showKeyboard), [showKeyboard, setShowKeyboard]);
  const handleKanaDisplayToggle = useCallback(() => 
    setShowKanaDisplay(!showKanaDisplay), [showKanaDisplay, setShowKanaDisplay]);

  return (
    <div className={styles.settings}>
      <div className={styles.settings__container}>
        <h1 className={styles.settings__title}>System Settings</h1>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>BGM</span>
            <div className={styles.settings__controls}>              <div
                className={`${styles.settings__toggle} ${bgmEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={handleBgmToggle}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={bgmVolume}
                onChange={handleBgmVolumeChange}
                disabled={!bgmEnabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Sound Effects</span>
            <div className={styles.settings__controls}>              <div
                className={`${styles.settings__toggle} ${soundEffectsEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={handleSoundEffectsToggle}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={soundEffectsVolume}
                onChange={handleSoundEffectsVolumeChange}
                disabled={!soundEffectsEnabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Hit Sound</span>
            <div className={styles.settings__controls}>              <div
                className={`${styles.settings__toggle} ${hitSoundEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={handleHitSoundToggle}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={hitSoundVolume}
                onChange={handleHitSoundVolumeChange}
                disabled={!hitSoundEnabled}
              />
            </div>
          </div>
        </div>        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Show Keyboard</span>
            <div className={styles.settings__controls}>              <div
                className={`${styles.settings__toggle} ${showKeyboard ? styles['settings__toggle--on'] : ''}`}
                onClick={handleKeyboardToggle}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Kana Display</span>
            <div className={styles.settings__controls}>
              <div
                className={`${styles.settings__toggle} ${showKanaDisplay ? styles['settings__toggle--on'] : ''}`}
                onClick={handleKanaDisplayToggle}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.settings__buttons}>
          <div className={styles.button} onClick={goBack}>
            Back
          </div>
          <div className={styles.button} onClick={goToMenu}>
            Main Menu
          </div>
        </div>
      </div>
    </div>  );
});

SettingsScreen.displayName = 'SettingsScreen';

export default SettingsScreen;
