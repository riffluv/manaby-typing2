'use client';

import React, { useState } from 'react';
import PureTypingGame from '../../components/PureTypingGame';
import UnifiedTypingGame from '../../components/UnifiedTypingGame';
import HighSpeedTypingTest from '../../components/HighSpeedTypingTest';
import { useTypingGameStore } from '../../store/typingGameStore';

/**
 * 高速タイピング詰まり問題の比較テストページ
 * typingmania-ref風純粋実装 vs 現在の実装 + 遅延測定テスト
 */
export default function HighSpeedTestPage() {
  const [currentMode, setCurrentMode] = useState<'pure' | 'current' | 'latency'>('latency');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // テスト用の単語データ
  const testWords = [
    {
      japanese: "こんにちは",
      kanaArray: [
        { kana: "こ", patterns: ["ko"] },
        { kana: "ん", patterns: ["nn", "n"] },
        { kana: "に", patterns: ["ni"] },
        { kana: "ち", patterns: ["ti", "chi"] },
        { kana: "は", patterns: ["ha"] }
      ]
    },
    {
      japanese: "タイピング",
      kanaArray: [
        { kana: "た", patterns: ["ta"] },
        { kana: "い", patterns: ["i"] },
        { kana: "ぴ", patterns: ["pi"] },
        { kana: "ん", patterns: ["nn", "n"] },
        { kana: "ぐ", patterns: ["gu"] }
      ]
    },
    {
      japanese: "プログラミング",
      kanaArray: [
        { kana: "ぷ", patterns: ["pu"] },
        { kana: "ろ", patterns: ["ro"] },
        { kana: "ぐ", patterns: ["gu"] },
        { kana: "ら", patterns: ["ra"] },
        { kana: "み", patterns: ["mi"] },
        { kana: "ん", patterns: ["nn", "n"] },
        { kana: "ぐ", patterns: ["gu"] }
      ]
    }
  ];

  const currentWord = testWords[currentWordIndex];

  const handleWordComplete = () => {
    const nextIndex = (currentWordIndex + 1) % testWords.length;
    setCurrentWordIndex(nextIndex);
  };

  const resetTest = () => {
    setCurrentWordIndex(0);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333', 
        marginBottom: '30px',
        fontSize: '28px'
      }}>
        🚀 高速タイピング詰まり問題 比較テスト
      </h1>

      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '2px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#444' }}>📋 テスト目的</h2>
        <p style={{ margin: '0', lineHeight: '1.6' }}>
          <strong>問題:</strong> 現在のWebAudio版で高速タイピング時に詰まる感じがする<br/>
          <strong>目標:</strong> typingmania-refレベルのレスポンシブな高速タイピングを実現<br/>
          <strong>比較:</strong> 純粋実装（Pure）vs 現在の実装（Current）の応答性比較
        </p>
      </div>      {/* モード切り替え */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => setCurrentMode('latency')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: currentMode === 'latency' ? '#2196F3' : '#f0f0f0',
            color: currentMode === 'latency' ? 'white' : '#333',
            border: '2px solid #2196F3',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔬 遅延測定テスト
        </button>
        <button
          onClick={() => setCurrentMode('pure')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: currentMode === 'pure' ? '#4CAF50' : '#f0f0f0',
            color: currentMode === 'pure' ? 'white' : '#333',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚀 Pure実装（typingmania-ref風）
        </button>
        <button
          onClick={() => setCurrentMode('current')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: currentMode === 'current' ? '#FF9800' : '#f0f0f0',
            color: currentMode === 'current' ? 'white' : '#333',
            border: '2px solid #FF9800',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⚙️ 現在の実装
        </button>
      </div>

      {/* 操作ボタン */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={resetTest}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 テストリセット
        </button>
        <button
          onClick={handleWordComplete}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ⏭️ 次の単語
        </button>
      </div>      {/* 現在のモード表示 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: currentMode === 'latency' ? '#e3f2fd' : currentMode === 'pure' ? '#e8f5e8' : '#fff3e0',
        borderRadius: '8px',
        border: `2px solid ${currentMode === 'latency' ? '#2196F3' : currentMode === 'pure' ? '#4CAF50' : '#FF9800'}`
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          {currentMode === 'latency' ? '🔬 遅延測定テストモード' : 
           currentMode === 'pure' ? '🚀 Pure実装モード' : '⚙️ 現在の実装モード'}
        </h3>
        <p style={{ margin: '0', color: '#666' }}>
          {currentMode === 'latency' 
            ? '高速入力遅延を数値で測定。WebAudio最適化の効果を定量的に確認。'
            : currentMode === 'pure' 
            ? 'typingmania-ref風の純粋実装。React最小限、WebAudio最軽量。'
            : '現在のOptimized実装。複雑な最適化とReactフック使用。'
          }
        </p>
      </div>      {/* タイピングゲーム表示 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {currentMode === 'latency' ? (
          <HighSpeedTypingTest />
        ) : currentMode === 'pure' ? (
          <PureTypingGame
            currentWord={currentWord}
            onWordComplete={handleWordComplete}
          />
        ) : (
          <UnifiedTypingGame />
        )}
      </div>

      {/* テスト指示 */}
      <div style={{ 
        marginTop: '30px',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 テスト方法</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Pure実装</strong>で高速タイピングを試し、レスポンスを確認</li>
          <li><strong>現在の実装</strong>に切り替えて同様に高速タイピング</li>
          <li>どちらがtypingmania-refに近い<strong>詰まらない</strong>レスポンスか比較</li>
          <li>特に<strong>連続入力</strong>時の音響遅延と視覚遅延を注意深く確認</li>
        </ol>
      </div>

      {/* パフォーマンス情報 */}
      <div style={{ 
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '6px',
          border: '1px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2E7D32' }}>🚀 Pure実装の特徴</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            <li>typingmania-ref Sfxクラス風WebAudio</li>
            <li>React フック最小限使用</li>
            <li>直接DOM操作なし（シンプルレンダリング）</li>
            <li>パフォーマンス測定オーバーヘッドなし</li>
          </ul>
        </div>
        <div style={{ 
          backgroundColor: '#fff3e0',
          padding: '15px',
          borderRadius: '6px',
          border: '1px solid #FF9800'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#F57C00' }}>⚙️ 現在の実装の特徴</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            <li>UltraFastKeyboardSound使用</li>
            <li>useOptimizedTypingProcessor</li>
            <li>複雑な最適化と監視システム</li>
            <li>パフォーマンス測定オーバーヘッド</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
