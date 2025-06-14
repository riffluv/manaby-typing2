'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TypingWord } from '@/types';
import AppLayout from '@/components/AppLayout';

// コンポーネントを動的インポート
const SimpleGameScreen = dynamic(() => import('@/components/SimpleGameScreen'), { ssr: false });

/**
 * 🚀 タイピングエンジンテストページ
 * 
 * HybridTypingEngine（コロシアム級最適化版）のテスト
 */
const EngineTestPage: React.FC = () => {
  // テスト用の単語
  const testWords: TypingWord[] = [
    {
      japanese: "超高速タイピング",
      hiragana: "ちょうこうそくたいぴんぐ",
      romaji: "tyoukousokutaipingu",
      typingChars: [],
      displayChars: []
    },
    {
      japanese: "ネイティブゲーム級",
      hiragana: "ねいてぃぶげーむきゅう",
      romaji: "neiteibugemukyuu",
      typingChars: [],
      displayChars: []
    },
    {
      japanese: "低遅延レスポンス",
      hiragana: "ていちえんれすぽんす",
      romaji: "teitienlresuponsu",
      typingChars: [],
      displayChars: []
    }
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWord = testWords[currentWordIndex];

  const handleWordComplete = () => {
    console.log(`Word completed: ${currentWord.japanese}`);
    // 次の単語に進む
    setCurrentWordIndex((prev) => (prev + 1) % testWords.length);
  };

  return (
    <AppLayout>
      <div style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(45deg, #0a0f1b, #1a2740)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e0e0e0',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* エンジン情報表示 */}
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd88a' }}>HybridEngine テスト</h3>
          
          <div style={{ fontSize: '12px', color: '#aaa' }}>
            <p>現在の単語: {currentWord.japanese}</p>
            <p>単語 {currentWordIndex + 1} / {testWords.length}</p>
            <p>エンジン: HybridTypingEngine（コロシアム級）</p>
          </div>
        </div>

        {/* 現在のエンジン表示 */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255,255,0,0.1)',
          padding: '10px 20px',
          borderRadius: '25px',
          border: '2px solid #ffff00',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          🔧 Hybrid Engine（コロシアム級）
        </div>

        {/* ゲーム画面 */}
        <SimpleGameScreen
          currentWord={currentWord}
          onWordComplete={handleWordComplete}
        />

        {/* 使用方法 */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <p>キーボードでタイピングして、コロシアム級レスポンスを体験してください</p>
          <p>Canvas描画・低遅延音響・最適化アニメーションが動作中</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default EngineTestPage;
