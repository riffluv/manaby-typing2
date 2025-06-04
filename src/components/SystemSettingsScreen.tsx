'use client';

import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';

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
    setBgmEnabled,
    setBgmVolume,
    setSoundEffectsEnabled,
    setSoundEffectsVolume,
    setHitSoundEnabled,
    setHitSoundVolume,
    setShowKeyboard,
  } = useSettingsStore();

  const handleBack = () => {
    router.back();
  };

  const handleMainMenu = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-start pt-[6vh] font-cinzel">
      <div className="system-container">
        <h1 className="system-title">System Settings</h1>

        {/* BGM設定 */}
        <div className="system-item">
          <div className="system-row">
            <span className="system-label">BGM</span>
            <div className="system-controls">
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
        <div className="system-item">
          <div className="system-row">
            <span className="system-label">Sound Effects</span>
            <div className="system-controls">
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
        <div className="system-item">
          <div className="system-row">
            <span className="system-label">Hit Sound</span>
            <div className="system-controls">
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
        <div className="system-item">
          <div className="system-row">
            <span className="system-label">Show Keyboard</span>
            <div className="system-controls">
              <Toggle
                checked={showKeyboard}
                onChange={setShowKeyboard}
              />
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="system-buttons">
          <button 
            className="system-button"
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className="system-button"
            onClick={handleMainMenu}
          >
            Main Menu
          </button>
        </div>
      </div>

      <style jsx>{`
        .system-container {
          width: 100%;
          max-width: 960px;
          padding: 2rem 3rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.6);
          border-radius: 16px;
          animation: fadeIn 1.2s ease;
        }

        .system-title {
          text-align: center;
          font-size: 2.8rem;
          color: #e5ccaa;
          letter-spacing: 0.15rem;
          margin-bottom: 2.5rem;
          text-shadow: 0 0 8px rgba(255, 220, 150, 0.3);
        }

        .system-item {
          padding: 1.2rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .system-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .system-label {
          font-size: 1.2rem;
          color: #c8b78d;
          min-width: 180px;
        }

        .system-controls {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .system-buttons {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2.5rem;
        }

        .system-button {
          padding: 0.5rem 2rem;
          border: 1px solid rgba(200, 200, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          color: #cce0ff;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 8px rgba(150, 180, 255, 0.1);
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .system-button:hover {
          background: rgba(180, 220, 255, 0.05);
          border-color: rgba(150, 180, 255, 0.3);
          color: #fff;
          box-shadow: 0 0 12px rgba(120, 180, 255, 0.2);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* スライダーのカスタムスタイル */
        :global(.slider::-webkit-slider-thumb) {
          appearance: none;
          width: 14px;
          height: 14px;
          background: #e5ccaa;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 6px #e5ccaa;
        }

        :global(.slider::-moz-range-thumb) {
          width: 14px;
          height: 14px;
          background: #e5ccaa;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 6px #e5ccaa;
          border: none;
        }
      `}</style>
    </div>
  );
}
