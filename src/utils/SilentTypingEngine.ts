/**
 * 音声なし高速タイピングテスト用の最小限エンジン
 * 音声処理を完全にバイパスして純粋なタイピング処理速度を測定
 */

export class SilentTypingEngine {
  private container: HTMLElement | null = null;
  private chars: Array<{
    kana: string;
    romaji: string;
    inputted: string;
    completed: boolean;
  }> = [];
  private currentIndex = 0;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  
  // パフォーマンス測定
  private measurements: number[] = [];
  private recording = false;

  constructor() {
    this.setupKeyHandler();
  }

  setContainer(container: HTMLElement) {
    this.container = container;
  }

  setWord(hiragana: string) {
    // 簡易ローマ字変換（テスト用）
    const romajiMap: { [key: string]: string } = {
      'こ': 'ko', 'ん': 'n', 'に': 'ni', 'ち': 'ti', 'は': 'ha',
      'あ': 'a', 'り': 'ri', 'が': 'ga', 'と': 'to', 'う': 'u',
      'お': 'o', 'つ': 'tu', 'か': 'ka', 'れ': 're', 'さ': 'sa', 'ま': 'ma',
      'ば': 'ba', 'っ': 'tta', 'て': 'te', 'よ': 'yo', 'し': 'si', 'く': 'ku'
    };

    this.chars = [];
    for (let char of hiragana) {
      if (romajiMap[char]) {
        this.chars.push({
          kana: char,
          romaji: romajiMap[char],
          inputted: '',
          completed: false
        });
      }
    }
    this.currentIndex = 0;
    this.render();
  }

  private setupKeyHandler() {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || !/[a-z]/.test(e.key)) return;
      
      const startTime = performance.now();
      
      // 純粋なタイピング処理（音声なし）
      const result = this.processKey(e.key);
      this.render();
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      if (this.recording) {
        this.measurements.push(latency);
      }
      
      e.preventDefault();
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  private processKey(key: string): 'correct' | 'error' | 'completed' {
    if (this.currentIndex >= this.chars.length) return 'completed';

    const currentChar = this.chars[this.currentIndex];
    const expectedChar = currentChar.romaji[currentChar.inputted.length];

    if (key === expectedChar) {
      currentChar.inputted += key;
      if (currentChar.inputted === currentChar.romaji) {
        currentChar.completed = true;
        this.currentIndex++;
      }
      return 'correct';
    } else {
      return 'error';
    }
  }

  private render() {
    if (!this.container) return;

    const html = this.chars.map((char, index) => {
      let displayChars = '';
      for (let i = 0; i < char.romaji.length; i++) {
        const romChar = char.romaji[i];
        let className = 'typing-char ';

        if (i < char.inputted.length) {
          className += 'completed';
        } else if (index === this.currentIndex && i === char.inputted.length) {
          className += 'current';
        } else {
          className += 'pending';
        }

        displayChars += `<span class="${className}">${romChar}</span>`;
      }
      return displayChars;
    }).join('');

    this.container.innerHTML = html;
  }

  startRecording() {
    this.measurements = [];
    this.recording = true;
    console.log('🎯 音声なしタイピング測定開始');
  }

  stopRecording() {
    this.recording = false;
    return this.getStats();
  }

  private getStats() {
    if (this.measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, acceptable: false };
    }

    const avg = this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length;
    const min = Math.min(...this.measurements);
    const max = Math.max(...this.measurements);
    const acceptable = avg <= 5 && max <= 10;

    return {
      count: this.measurements.length,
      avg: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      acceptable
    };
  }

  isCompleted(): boolean {
    return this.currentIndex >= this.chars.length;
  }

  destroy() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  reset() {
    this.currentIndex = 0;
    this.chars.forEach(char => {
      char.inputted = '';
      char.completed = false;
    });
    this.render();
  }
}

export default SilentTypingEngine;
