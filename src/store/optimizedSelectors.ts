/**
 * 最適化されたタイピングゲームストアセレクター
 * - 細分化されたセレクターによる不要な再レンダリング防止
 * - 安定した参照を提供
 */

import { useGameStatus, useCurrentWord, useCurrentWordIndex, useQuestionCount } from './typingGameStore';

// 既存の最適化されたセレクターを活用
export const useOptimizedGameStatus = useGameStatus;
export const useOptimizedCurrentWord = useCurrentWord;
export const useOptimizedCurrentWordIndex = useCurrentWordIndex;
export const useOptimizedQuestionCount = useQuestionCount;