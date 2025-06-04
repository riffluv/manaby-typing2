import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import styles from './SettingsScreen.module.css';

const SettingsScreen: React.FC = () => {
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
    setBgmEnabled,
    setBgmVolume,
    setSoundEffectsEnabled,
    setSoundEffectsVolume,
    setHitSoundEnabled,
    setHitSoundVolume,
    setShowKeyboard,
  } = useSettingsStore();

  return (
    <div className={styles.settings}>
      <div className={styles.settings__container}>
        <h1 className={styles.settings__title}>System Settings</h1>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>BGM</span>
            <div className={styles.settings__controls}>
              <div
                className={`${styles.settings__toggle} ${bgmEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={() => setBgmEnabled(!bgmEnabled)}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(Number(e.target.value))}
                disabled={!bgmEnabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Sound Effects</span>
            <div className={styles.settings__controls}>
              <div
                className={`${styles.settings__toggle} ${soundEffectsEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={soundEffectsVolume}
                onChange={(e) => setSoundEffectsVolume(Number(e.target.value))}
                disabled={!soundEffectsEnabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Hit Sound</span>
            <div className={styles.settings__controls}>
              <div
                className={`${styles.settings__toggle} ${hitSoundEnabled ? styles['settings__toggle--on'] : ''}`}
                onClick={() => setHitSoundEnabled(!hitSoundEnabled)}
              ></div>
              <input
                type="range"
                className={styles.settings__slider}
                min="0"
                max="10"
                value={hitSoundVolume}
                onChange={(e) => setHitSoundVolume(Number(e.target.value))}
                disabled={!hitSoundEnabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Show Keyboard</span>
            <div className={styles.settings__controls}>
              <div
                className={`${styles.settings__toggle} ${showKeyboard ? styles['settings__toggle--on'] : ''}`}
                onClick={() => setShowKeyboard(!showKeyboard)}
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
    </div>
  );
};

export default SettingsScreen;
