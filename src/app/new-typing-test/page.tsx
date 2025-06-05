'use client';

import React, { useState } from 'react';
import NewSimpleGameScreen from '@/components/NewSimpleGameScreen';
import { TypingWord, PerWordScoreLog } from '@/types';

const testWords: Array<{ japanese: string; hiragana: string }> = [
  { japanese: "プログラミング", hiragana: "ぷろぐらみんぐ" },
  { japanese: "タイピング", hiragana: "たいぴんぐ" },
  { japanese: "キーボード", hiragana: "きーぼーど" },
  { japanese: "コンピューター", hiragana: "こんぴゅーたー" },
  { japanese: "日本語", hiragana: "にほんご" },
];

/**
 * 新タイピングシステムテストページ
 * typingmania-ref流のリファクタリング後システムをテスト
 */
export default function NewTypingTestPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<PerWordScoreLog[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentTestWord = testWords[currentWordIndex];
  const currentWord: TypingWord = {
    japanese: currentTestWord.japanese,
    hiragana: currentTestWord.hiragana,
    romaji: '', // JapaneseConverterで自動生成される
    typingChars: [], // 新システムで自動生成される
    displayChars: [],
  };

  const handleWordComplete = (scoreLog: PerWordScoreLog) => {
    console.log('単語完了:', scoreLog);
    setCompletedWords(prev => [...prev, scoreLog]);

    if (currentWordIndex < testWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const resetTest = () => {
    setCurrentWordIndex(0);
    setCompletedWords([]);
    setIsFinished(false);
  };

  if (isFinished) {
    // 結果表示
    const totalCorrect = completedWords.reduce((sum, log) => sum + log.correct, 0);
    const totalMiss = completedWords.reduce((sum, log) => sum + log.miss, 0);
    const avgKpm = completedWords.reduce((sum, log) => sum + log.kpm, 0) / completedWords.length;
    const avgAccuracy = completedWords.reduce((sum, log) => sum + log.accuracy, 0) / completedWords.length;

    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🎉 新タイピングシステムテスト完了！</h1>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h2>📊 結果統計</h2>
          <p><strong>システム:</strong> 新TypingEngine + TypingChar + JapaneseConverter</p>
          <p><strong>平均KPM:</strong> {avgKpm.toFixed(1)}</p>
          <p><strong>平均精度:</strong> {(avgAccuracy * 100).toFixed(1)}%</p>
          <p><strong>正解数:</strong> {totalCorrect}</p>
          <p><strong>ミス数:</strong> {totalMiss}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>📝 単語別結果</h3>
          {completedWords.map((log, index) => (
            <div key={index} style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px' }}>
              <strong>{testWords[index].japanese}</strong> ({testWords[index].hiragana})
              <br />
              KPM: {log.kpm} | 精度: {(log.accuracy * 100).toFixed(1)}% | 
              正解: {log.correct} | ミス: {log.miss} | 時間: {log.duration.toFixed(2)}s
            </div>
          ))}
        </div>

        <button 
          onClick={resetTest}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          もう一度テスト
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 新タイピングシステムテスト</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>📋 テスト情報</h2>
        <p><strong>システム:</strong> 新TypingEngine + TypingChar + JapaneseConverter</p>
        <p><strong>進捗:</strong> {currentWordIndex + 1} / {testWords.length}</p>
        <p><strong>目標:</strong> デモページレベルの高速レスポンス確認</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <NewSimpleGameScreen
          currentWord={currentWord}
          onWordComplete={handleWordComplete}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📚 テスト単語リスト</h3>
        {testWords.map((word, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '8px', 
              backgroundColor: index === currentWordIndex ? '#fff3cd' : index < currentWordIndex ? '#d4edda' : '#f8f9fa',
              marginBottom: '5px',
              borderRadius: '4px'
            }}
          >
            {index === currentWordIndex ? '👉 ' : index < currentWordIndex ? '✅ ' : '⏳ '}
            {word.japanese} ({word.hiragana})
          </div>
        ))}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
        <strong>💡 テスト方法:</strong>
        <ul style={{ marginBottom: 0 }}>
          <li>表示された単語をローマ字で入力してください</li>
          <li>キー応答速度とタイピング体験を確認</li>
          <li>デモページと同等の高速性を期待</li>
          <li>ji/zi, fu/hu などの複数パターンもサポート</li>
        </ul>
      </div>
    </div>
  );
}
