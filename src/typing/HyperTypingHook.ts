/**
 * HyperTypingHook - Phase 1 性能突破 React統合フック
 * 
 * 🚀 HyperTypingEngineをReactで使用するためのカスタムフック
 * 従来のuseTypingとの互換性を保ちながら性能向上機能を提供
 */

import { useRef, useState, useEffect } from 'react';
import { HyperTypingEngine } from './HyperTypingEngine';
import { PerformanceProfiler } from '@/utils/PerformanceProfiler';
import type { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog, TypingWord } from '@/types';

export interface HyperTypingHookProps {
  word: TypingWord;
  typingChars: TypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
}

export interface HyperTypingHookReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentCharIndex: number;
  kanaDisplay: KanaDisplay | null;
  detailedProgress: {
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: {
      acceptedText: string;
      remainingText: string;
      displayText: string;
    };  } | null;
  getDetailedProgress: () => any;
}

/**
 * 🚀 HyperTypingEngine React統合フック
 * 
 * Phase 1最適化機能:
 * - RequestIdleCallback背景計算
 * - 予測キャッシング 0ms応答
 * - 差分DOM更新システム
 * - 性能メトリクス取得
 */
export function useHyperTyping({
  word,
  typingChars,
  onWordComplete,
}: HyperTypingHookProps): HyperTypingHookReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<HyperTypingEngine | null>(null);
  const currentWordRef = useRef<string | undefined>(undefined);
    // 進行状況の状態
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: {
      acceptedText: string;
      remainingText: string;
      displayText: string;
    };
  } | null>(null);
  /**
   * 🚀 HyperTypingEngine 初期化
   * 従来のTypingEngineと同じ I/F を維持
   */
  const initializeEngine = () => {
    const startTime = PerformanceProfiler.start('react_engine_initialization');
    
    if (!containerRef.current || !typingChars.length) {
      PerformanceProfiler.end('react_engine_initialization', startTime);
      return;
    }

    // 前のエンジンがあればクリーンアップ
    if (engineRef.current) {
      PerformanceProfiler.measure('react_engine_cleanup', () => {
        engineRef.current!.cleanup();
      });
    }

    // 🚀 新しいHyperTypingEngineを作成
    const engineCreationStart = PerformanceProfiler.start('react_engine_creation');
    engineRef.current = new HyperTypingEngine();
    PerformanceProfiler.end('react_engine_creation', engineCreationStart);
    
    // エンジン初期化（従来と同じインターフェース）
    PerformanceProfiler.measure('react_engine_setup', () => {
      engineRef.current!.initialize(
        containerRef.current!,
        typingChars,
        (index: number, display: KanaDisplay) => {
          PerformanceProfiler.measure('react_state_update_progress', () => {
            setCurrentCharIndex(index);
            setKanaDisplay(display);
            updateDetailedProgress();
          });
        },
        (scoreLog: PerWordScoreLog) => {
          PerformanceProfiler.measure('react_state_update_complete', () => {
            onWordComplete?.(scoreLog);
          });
        }
      );
    });

    updateDetailedProgress();
    PerformanceProfiler.end('react_engine_initialization', startTime);
  };

  /**
   * 詳細進捗更新
   */
  const updateDetailedProgress = () => {
    if (!engineRef.current) return;

    const progress = engineRef.current.getDetailedProgress();
    setDetailedProgress(progress);
  };
  /**
   * 詳細進捗取得
   */
  const getDetailedProgress = () => {
    return engineRef.current?.getDetailedProgress() || null;
  };

  // React Strict Mode対応の初期化Effect
  useEffect(() => {
    const newWordKey = word.hiragana || word.japanese || '';
    
    // 初期化条件チェック
    if (!containerRef.current || !typingChars.length) {
      return;
    }

    // 既に同じ単語で初期化済みかつエンジンが生きている場合はスキップ
    if (currentWordRef.current === newWordKey && engineRef.current) {
      return;
    }
    
    currentWordRef.current = newWordKey;
    initializeEngine();
    
    // Strict Mode対応：クリーンアップ関数を返す
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word.hiragana, word.japanese, typingChars]);
  return {
    containerRef,
    currentCharIndex,
    kanaDisplay,
    detailedProgress,
    getDetailedProgress,
  };
}

export default useHyperTyping;
