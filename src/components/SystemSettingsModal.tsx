import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSettingsStore as useGameSettingsStore } from '@/store/settingsStore';
import styles from './MainMenu.eldenring.bem.module.css';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose }) => {
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
    resetToDefaults: resetAudioSettings
  } = useSettingsStore();

  // ゲーム設定ストア
  const {
    enableOptimization,
    enablePerformanceMonitoring,
    enableDebugMode,
    questionCount,
    autoStart,
    setEnableOptimization,
    setEnablePerformanceMonitoring,
    setEnableDebugMode,
    setQuestionCount,
    setAutoStart,
    resetToDefaults: resetGameSettings
  } = useGameSettingsStore();

  const handleResetAll = () => {
    resetAudioSettings();
    resetGameSettings();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.modal} ${styles['modal--active']}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-settings-title"
    >
      <div 
        className={styles.modal__overlay} 
        onClick={onClose}
      ></div>
      <div className={styles.modal__content}>
        <div className={styles.modal__sidebar}>
          <h2 id="system-settings-title" className={styles.modal__title}>
            SYSTEM SETTINGS
          </h2>
          
          {/* 音響設定セクション */}
          <div className={styles.settings__section}>
            <h3 className={styles.settings__sectionTitle}>音響設定</h3>
            
            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={bgmEnabled}
                  onChange={(e) => setBgmEnabled(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                BGM再生
              </label>
              {bgmEnabled && (
                <div className={styles.settings__volumeControl}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(Number(e.target.value))}
                    className={styles.settings__slider}
                  />
                  <span className={styles.settings__volumeValue}>{bgmVolume}</span>
                </div>
              )}
            </div>

            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={soundEffectsEnabled}
                  onChange={(e) => setSoundEffectsEnabled(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                効果音再生
              </label>
              {soundEffectsEnabled && (
                <div className={styles.settings__volumeControl}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={soundEffectsVolume}
                    onChange={(e) => setSoundEffectsVolume(Number(e.target.value))}
                    className={styles.settings__slider}
                  />
                  <span className={styles.settings__volumeValue}>{soundEffectsVolume}</span>
                </div>
              )}
            </div>

            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={hitSoundEnabled}
                  onChange={(e) => setHitSoundEnabled(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                キー入力音
              </label>
              {hitSoundEnabled && (
                <div className={styles.settings__volumeControl}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={hitSoundVolume}
                    onChange={(e) => setHitSoundVolume(Number(e.target.value))}
                    className={styles.settings__slider}
                  />
                  <span className={styles.settings__volumeValue}>{hitSoundVolume}</span>
                </div>
              )}
            </div>
          </div>

          {/* 表示設定セクション */}
          <div className={styles.settings__section}>
            <h3 className={styles.settings__sectionTitle}>表示設定</h3>
            
            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={showKeyboard}
                  onChange={(e) => setShowKeyboard(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                キーボード表示
              </label>
            </div>
          </div>

          {/* ゲーム設定セクション */}
          <div className={styles.settings__section}>
            <h3 className={styles.settings__sectionTitle}>ゲーム設定</h3>
            
            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                出題数:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className={styles.settings__numberInput}
                />
              </label>
            </div>

            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                自動スタート
              </label>
            </div>
          </div>

          {/* パフォーマンス設定セクション */}
          <div className={styles.settings__section}>
            <h3 className={styles.settings__sectionTitle}>パフォーマンス</h3>
            
            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={enableOptimization}
                  onChange={(e) => setEnableOptimization(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                最適化モード
              </label>
            </div>

            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={enablePerformanceMonitoring}
                  onChange={(e) => setEnablePerformanceMonitoring(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                パフォーマンス監視
              </label>
            </div>

            <div className={styles.settings__item}>
              <label className={styles.settings__label}>
                <input
                  type="checkbox"
                  checked={enableDebugMode}
                  onChange={(e) => setEnableDebugMode(e.target.checked)}
                  className={styles.settings__checkbox}
                />
                デバッグモード
              </label>
            </div>
          </div>
        </div>

        <div className={styles.modal__main}>
          <div className={styles.settings__actions}>
            <button 
              className={styles.modal__button}
              onClick={handleResetAll}
              type="button"
            >
              設定をリセット
            </button>
            <button 
              className={styles.modal__close} 
              onClick={onClose}
              type="button"
              aria-label="設定を閉じる"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsModal;
