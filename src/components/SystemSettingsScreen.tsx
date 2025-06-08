'use client';

import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
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
  } = useSettingsStore();

  const handleBack = () => {
    router.back();
  };

  const handleMainMenu = () => {
    router.push('/');
  };
  return (
    <div className={styles.settings}>
      <div className={styles.settings__container}>
        <h1 className={styles.settings__title}>System Settings</h1>

        {/* BGM設定 */}
        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>BGM</span>
            <div className={styles.settings__controls}>
              <Toggle
                checked={bgmEnabled}
                onChange={setBgmEnabled}
              />
              <Slider
                value={bgmVolume}
                onChange={setBgmVolume}
                min={0}
                max={10}
                disabled={!bgmEnabled}
              />
            </div>
          </div>
        </div>

        {/* Sound Effects設定 */}
        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Sound Effects</span>
            <div className={styles.settings__controls}>
              <Toggle
                checked={soundEffectsEnabled}
                onChange={setSoundEffectsEnabled}
              />
              <Slider
                value={soundEffectsVolume}
                onChange={setSoundEffectsVolume}
                min={0}
                max={10}
                disabled={!soundEffectsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Hit Sound設定 */}
        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Hit Sound</span>
            <div className={styles.settings__controls}>
              <Toggle
                checked={hitSoundEnabled}
                onChange={setHitSoundEnabled}
              />
              <Slider
                value={hitSoundVolume}
                onChange={setHitSoundVolume}
                min={0}
                max={10}
                disabled={!hitSoundEnabled}
              />
            </div>
          </div>
        </div>

        {/* Show Keyboard設定 */}
        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Show Keyboard</span>
            <div className={styles.settings__controls}>
              <Toggle
                checked={showKeyboard}
                onChange={setShowKeyboard}
              />
            </div>
          </div>
        </div>

        {/* Kana Display設定 */}
        <div className={styles.settings__item}>
          <div className={styles.settings__row}>
            <span className={styles.settings__label}>Kana Display</span>
            <div className={styles.settings__controls}>
              <Toggle
                checked={showKanaDisplay}
                onChange={setShowKanaDisplay}
              />
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className={styles.settings__buttons}>
          <button 
            className={styles.settings__button}
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className={styles.settings__button}
            onClick={handleMainMenu}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
