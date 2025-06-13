'use client';

import { useReducer, useCallback } from 'react';
import { addRankingEntry } from '@/lib/rankingManaby2';
import type { GameScoreLog } from '@/types';
import { useTypingGameStore } from '@/store/typingGameStore';

// モーダル状態の型定義
type ModalState = {
  show: boolean;
  name: string;
  registering: boolean;
  done: boolean;
  error: string;
};

// 初期状態
const initialModalState: ModalState = {
  show: false,
  name: '',
  registering: false,
  done: false,
  error: '',
};

// モーダル状態更新のためのアクション
type ModalAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'setName'; name: string }
  | { type: 'registering' }
  | { type: 'success' }
  | { type: 'error'; error: string };

// モーダル状態更新のReducer
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'open': return { ...state, show: true, done: false, error: '', name: '' };
    case 'close': return { ...initialModalState };
    case 'setName': return { ...state, name: action.name };
    case 'registering': return { ...state, registering: true, error: '' };
    case 'success': return { ...state, registering: false, done: true, error: '' };
    case 'error': return { ...state, registering: false, error: action.error };
    default: return state;
  }
}

/**
 * ランキングモーダル制御フック
 * @returns モーダル表示状態・操作関数
 */
export function useRankingModal(
  resultScore: GameScoreLog['total'] | null,
  isScoreRegistered: boolean,
  onScoreRegistered: () => void
) {
  const [modalState, dispatch] = useReducer(modalReducer, initialModalState);
  const mode = useTypingGameStore(state => state.mode); // 現在の難易度

  // ランキング登録処理
  const handleRegisterRanking = useCallback(async () => {
    if (!resultScore || !modalState.name.trim() || isScoreRegistered) return;
    
    dispatch({ type: 'registering' });
    
    try {
      await addRankingEntry({
        name: modalState.name.trim(),
        kpm: resultScore.kpm,
        accuracy: resultScore.accuracy,
        correct: resultScore.correct,
        miss: resultScore.miss,
        mode // 難易度を保存
      });
      
      // 登録成功時の処理
      onScoreRegistered();
      dispatch({ type: 'success' });
      
      // 成功メッセージを表示後、モーダルを閉じる
      setTimeout(() => dispatch({ type: 'close' }), 1200);    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      dispatch({ 
        type: 'error', 
        error: '登録に失敗しました: ' + errorMessage 
      });
    }
  }, [resultScore, modalState.name, isScoreRegistered, onScoreRegistered, mode]);

  return {
    modalState,
    dispatch,
    handleRegisterRanking
  };
}
