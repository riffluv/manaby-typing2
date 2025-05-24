import { japaneseToRomajiMap, convertHiraganaToRomaji, TypingChar } from '../japaneseUtils';

describe('japaneseToRomajiMap', () => {
  it('ひらがな→ローマ字変換が正しい', () => {
    // 基本変換
    expect(japaneseToRomajiMap['し']).toContain('shi');
    expect(japaneseToRomajiMap['し']).toContain('si');
    expect(japaneseToRomajiMap['し']).toContain('ci');
    expect(japaneseToRomajiMap['ち']).toContain('chi');
    expect(japaneseToRomajiMap['ち']).toContain('ti');
    expect(japaneseToRomajiMap['ふ']).toContain('fu');
    expect(japaneseToRomajiMap['ふ']).toContain('hu');
    
    // 拡張パターン
    expect(japaneseToRomajiMap['じゃ']).toContain('ja');
    expect(japaneseToRomajiMap['じゃ']).toContain('zya');
    
    // 小さい文字
    expect(japaneseToRomajiMap['ぁ']).toContain('xa');
    expect(japaneseToRomajiMap['ぁ']).toContain('la');
    
    // 「ん」の複数パターン
    expect(japaneseToRomajiMap['ん']).toContain('n');
    expect(japaneseToRomajiMap['ん']).toContain('nn');
    expect(japaneseToRomajiMap['ん']).toContain('xn');
  });
});

describe('convertHiraganaToRomaji', () => {
  it('基本的なひらがなをローマ字に変換できる', () => {
    const result = convertHiraganaToRomaji('こんにちは');
    expect(result.length).toBe(5);
    expect(result[0].kana).toBe('こ');
    expect(result[0].romaji).toBe('ko');
    expect(result[1].kana).toBe('ん');
    expect(result[2].kana).toBe('に');
    expect(result[3].kana).toBe('ち');
    expect(result[4].kana).toBe('は');
  });
  
  it('促音（っ）を正しく処理できる', () => {
    const result = convertHiraganaToRomaji('けっか');
    expect(result.length).toBe(3);
    expect(result[0].kana).toBe('け');
    expect(result[1].kana).toBe('っ');
    expect(result[2].kana).toBe('か');
    expect(result[1].alternatives).toContain('k'); // 次の文字の子音を重ねる
  });
  
  it('「ん」の後に母音がある場合、n\'を含む', () => {
    const result = convertHiraganaToRomaji('こんあ');
    expect(result.length).toBe(3);
    expect(result[1].kana).toBe('ん');
    expect(result[1].alternatives).toContain("n'");
  });
});

describe('TypingChar', () => {
  it('複数のパターンを受け入れることができる', () => {
    const typingChar = new TypingChar('し', ['si', 'shi', 'ci']);
    
    // 's'は'si'と'shi'の両方でマッチする
    expect(typingChar.canAccept('s')).toBe(true);
    typingChar.accept('s');
    
    // 's'の後は'i'と'h'の両方が有効
    expect(typingChar.canAccept('i')).toBe(true);
    expect(typingChar.canAccept('h')).toBe(true);
    
    // しかし'a'は無効
    expect(typingChar.canAccept('a')).toBe(false);
  });
  
  it('入力が完了すると完了フラグがセットされる', () => {
    const typingChar = new TypingChar('し', ['si', 'shi']);
    
    expect(typingChar.completed).toBe(false);
    typingChar.accept('s');
    expect(typingChar.completed).toBe(false);
    typingChar.accept('i');
    expect(typingChar.completed).toBe(true);
  });
  
  it('大文字小文字を区別しない', () => {
    const typingChar = new TypingChar('し', ['si', 'shi']);
    
    expect(typingChar.canAccept('S')).toBe(true);
    typingChar.accept('S');
    expect(typingChar.acceptedInput).toBe('s');
  });
  
  it('有効なパターンを動的に更新する', () => {
    const typingChar = new TypingChar('し', ['si', 'shi']);
    
    expect(typingChar.getActivePatterns().length).toBe(2);
    typingChar.accept('s');
    expect(typingChar.getActivePatterns().length).toBe(2);
    typingChar.accept('h');
    // 'sh'の入力後は'shi'のみ有効
    expect(typingChar.getActivePatterns().length).toBe(1);
    expect(typingChar.getActivePatterns()[0]).toBe('shi');
  });
});
