// TextTypingEngineの動作サンプル（Node/ブラウザ両対応）
import { TextTypingEngine } from './TextTypingEngine';
import { wordList } from '../data/wordList';

// サンプル：最初のお題を使う
const { hiragana, japanese } = wordList[0];
const engine = new TextTypingEngine(hiragana);

console.log('【お題】', japanese, '(', hiragana, ')');

function printState() {
  const state = engine.getState();
  console.log('進行:', state.accepted + state.remaining);
  console.log('入力済:', state.accepted);
  console.log('残り  :', state.remaining);
  if (!state.completed) {
    console.log('今のかな:', state.currentKana);
    console.log('今のローマ字:', state.currentRomaji);
    console.log('今のパターン:', state.currentPatterns.join(' / '));
    console.log('今押すべきキー:', state.currentKey);
  } else {
    console.log('【完了】');
  }
  console.log('-------------------');
}

printState();

// サンプル：自動で正解キーを順に入力して進行
function autoType() {
  let state = engine.getState();
  while (!state.completed) {
    const key = state.currentKey;
    engine.input(key);
    printState();
    state = engine.getState();
  }
}

// 実行
// autoType();
// 手動でキー入力したい場合は engine.input('t') などで呼び出し

export {};
