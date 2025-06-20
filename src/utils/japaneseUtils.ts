/**
 * ひらがなとローマ字の変換テーブル
 * etypping-refの実装を参考に拡充
 */
export const japaneseToRomajiMap: { [key: string]: string[] } = {
  // 基本的なひらがな
  'あ': ['a'],
  'い': ['i', 'yi'],
  'う': ['u', 'wu'],
  'え': ['e'],
  'お': ['o'],
  'か': ['ka', 'ca'],
  'き': ['ki'],
  'く': ['ku', 'cu', 'qu'],
  'け': ['ke'],
  'こ': ['ko', 'co'],
  'さ': ['sa'],
  'し': ['si', 'shi', 'ci'],
  'す': ['su'],
  'せ': ['se', 'ce'],
  'そ': ['so'],
  'た': ['ta'],
  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],
  'て': ['te'],
  'と': ['to'],
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['fu', 'hu'],
  'へ': ['he'],
  'ほ': ['ho'],
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],
  'ら': ['ra'],
  'り': ['ri'],
  'る': ['ru'],
  'れ': ['re'],
  'ろ': ['ro'],
  'わ': ['wa'],
  'を': ['wo'],
  'ん': ['nn', 'xn', 'n'],
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],
  'ざ': ['za'],
  'じ': ['zi', 'ji'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],
  'だ': ['da'],
  'ぢ': ['di', 'ji'],
  'づ': ['du', 'zu'],
  'で': ['de'],
  'ど': ['do'],
  'ば': ['ba'],
  'び': ['bi'],
  'ぶ': ['bu'],
  'べ': ['be'],
  'ぼ': ['bo'],
  'ぱ': ['pa'],
  'ぴ': ['pi'],
  'ぷ': ['pu'],
  'ぺ': ['pe'],
  'ぽ': ['po'],
  
  // 拗音
  'きゃ': ['kya'],
  'きぃ': ['kyi'],
  'きゅ': ['kyu'],
  'きぇ': ['kye'],
  'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'],
  'しぃ': ['syi'],
  'しゅ': ['syu', 'shu'],
  'しぇ': ['sye', 'she'],
  'しょ': ['syo', 'sho'],
  'ちゃ': ['tya', 'cha'],
  'ちぃ': ['tyi'],
  'ちゅ': ['tyu', 'chu'],
  'ちぇ': ['tye', 'che'],
  'ちょ': ['tyo', 'cho'],
  'にゃ': ['nya'],
  'にぃ': ['nyi'],
  'にゅ': ['nyu'],
  'にぇ': ['nye'],
  'にょ': ['nyo'],
  'ひゃ': ['hya'],
  'ひぃ': ['hyi'],
  'ひゅ': ['hyu'],
  'ひぇ': ['hye'],
  'ひょ': ['hyo'],
  'みゃ': ['mya'],
  'みぃ': ['myi'],
  'みゅ': ['myu'],
  'みぇ': ['mye'],
  'みょ': ['myo'],
  'りゃ': ['rya'],
  'りぃ': ['ryi'],
  'りゅ': ['ryu'],
  'りぇ': ['rye'],
  'りょ': ['ryo'],
  'ぎゃ': ['gya'],
  'ぎぃ': ['gyi'],
  'ぎゅ': ['gyu'],
  'ぎぇ': ['gye'],
  'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya'],
  'じぃ': ['jyi', 'zyi'],
  'じゅ': ['ju', 'zyu'],
  'じぇ': ['je', 'zye'],
  'じょ': ['jo', 'zyo'],
  'びゃ': ['bya'],
  'びぃ': ['byi'],
  'びゅ': ['byu'],
  'びぇ': ['bye'],
  'びょ': ['byo'],
  'ぴゃ': ['pya'],
  'ぴぃ': ['pyi'],
  'ぴゅ': ['pyu'],
  'ぴぇ': ['pye'],
  'ぴょ': ['pyo'],
  
  // 促音 (小さいつ)
  'っ': ['xtu', 'xtsu', 'ltu'],
  
  // 小さい文字
  'ぁ': ['xa', 'la'],
  'ぃ': ['xi', 'li'],
  'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le'],
  'ぉ': ['xo', 'lo'],
  'ゃ': ['xya', 'lya'],
  'ゅ': ['xyu', 'lyu'],
  'ょ': ['xyo', 'lyo'],
  
  // 特殊なケース
  'ふぁ': ['fa'],
  'ふぃ': ['fi'],
  'ふぇ': ['fe'],
  'ふぉ': ['fo'],
  'うぁ': ['wha', 'wa'],
  'うぃ': ['whi', 'wi'],
  'うぇ': ['whe', 'we'],
  'うぉ': ['who', 'wo'],
  'ゔぁ': ['va'],
  'ゔぃ': ['vi'],
  'ゔぇ': ['ve'],
  'ゔぉ': ['vo'],
  'ゔ': ['vu'],
  
  // 拡張パターン (etypping-refより)
  'くぁ': ['qa', 'qwa'],
  'くぃ': ['qi', 'qwi'],
  'くぇ': ['qe', 'qwe'],
  'くぉ': ['qo', 'qwo'],
  'くゃ': ['qya'],
  'くゅ': ['qyu'],
  'くょ': ['qyo'],
  'つぁ': ['tsa'],
  'つぃ': ['tsi'],
  'つぇ': ['tse'],
  'つぉ': ['tso'],
  'てゃ': ['tha'],
  'てぃ': ['thi'],
  'てゅ': ['thu'],
  'てぇ': ['the'],
  'てょ': ['tho'],
  'とぁ': ['twa'],
  'とぃ': ['twi'],
  'とぅ': ['twu'],
  'とぇ': ['twe'],
  'とぉ': ['two'],
  'でゃ': ['dha'],
  'でぃ': ['dhi'],
  'でゅ': ['dhu'],
  'でぇ': ['dhe'],
  'でょ': ['dho'],
  'ぢゃ': ['dya'],
  'ぢぃ': ['dyi'],
  'ぢゅ': ['dyu'],
  'ぢぇ': ['dye'],
  'ぢょ': ['dyo'],
  'ぐぁ': ['gwa'],
  'ぐぃ': ['gwi'],
  'ぐぅ': ['gwu'],
  'ぐぇ': ['gwe'],
  'ぐぉ': ['gwo'],
  
  // 長音
  'ー': ['-'],
  
  // 空白と記号
  '　': [' '],
  ' ': [' '],
  ',': [','],
  '.': ['.'],
  '、': [','],
  '。': ['.'],
  '・': ['/'],
};

/**
 * ひらがなをローマ字に変換する関数
 * 複数の入力パターンをサポート
 */
export const convertHiraganaToRomaji = (hiragana: string) => {
  const result: Array<{
    kana: string;
    romaji: string;
    alternatives: string[];
  }> = [];
  let position = 0;
  
  while (position < hiragana.length) {
    // 3文字の組み合わせをチェック
    if (position + 2 < hiragana.length) {
      const threeChars = hiragana.substring(position, position + 3);
      if (japaneseToRomajiMap[threeChars]) {
        result.push({
          kana: threeChars,
          romaji: japaneseToRomajiMap[threeChars][0],
          alternatives: japaneseToRomajiMap[threeChars]
        });
        position += 3;
        continue;
      }
    }
    
    // 2文字の組み合わせをチェック
    if (position + 1 < hiragana.length) {
      const twoChars = hiragana.substring(position, position + 2);
      if (japaneseToRomajiMap[twoChars]) {
        result.push({
          kana: twoChars,
          romaji: japaneseToRomajiMap[twoChars][0],
          alternatives: japaneseToRomajiMap[twoChars]
        });
        position += 2;
        continue;
      }
    }
    
    // 1文字をチェック
    const oneChar = hiragana[position];
    if (japaneseToRomajiMap[oneChar]) {
      result.push({
        kana: oneChar,
        romaji: japaneseToRomajiMap[oneChar][0],
        alternatives: japaneseToRomajiMap[oneChar]
      });
    } else {
      // マッピングがない場合はそのままの文字を使用
      result.push({
        kana: oneChar,
        romaji: oneChar,
        alternatives: [oneChar]
      });
    }
    position++;
  }
  
  // 促音（っ）の特殊処理 - typingmaniaの実装に基づく
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].kana === 'っ') {
      const nextItem = result[i + 1];
      
      // 次の文字が存在しない場合やカンマ、ピリオドの場合は通常の処理
      if (!nextItem || nextItem.romaji.match(/^[,.]/) || 
          nextItem.romaji[0].match(/^[aiueon]/)) {
        // デフォルトのままでOK（xtu, xtsu, ltuなど）
      } else {
        // 次の文字の各代替入力の最初の文字を抽出して促音として設定
        const sokuonAlternatives: string[] = [];
        
        // 次の文字の全ての代替入力から最初の文字を抽出
        for (const alt of nextItem.alternatives) {
          if (alt.length > 0 && 'bcdfghjklmnpqrstvwxyz'.includes(alt[0])) {
            sokuonAlternatives.push(alt[0]);
          }
        }
        
        // 重複を削除
        const uniqueSokuon = [...new Set(sokuonAlternatives)];
        
        // 促音文字の代替入力を更新（子音のみ）
        result[i].alternatives = uniqueSokuon;
        result[i].romaji = uniqueSokuon[0] || 'xtu'; // フォールバック
      }
    }
  }
  
  // 「ん」の特殊処理 (IMEと同じ自然な判定)
  for (let i = 0; i < result.length; i++) {
    if (result[i].kana === 'ん') {
      const isLast = i === result.length - 1;
      let nextKana = '';
      let nextRomaji = '';
      if (!isLast) {
        nextKana = result[i + 1].kana;
        nextRomaji = result[i + 1].romaji;
      }
      // 文末 or 次があ行・な行・や行・ん の場合は n 単独不可
      const isAgyo = nextRomaji && 'aiueo'.includes(nextRomaji[0]);
      const isN = nextRomaji && nextRomaji[0] === 'n';
      const isY = nextRomaji && nextRomaji[0] === 'y';
      const isNa = nextKana && ['な','に','ぬ','ね','の'].includes(nextKana);
      const isYa = nextKana && ['や','ゆ','よ'].includes(nextKana);
      const isNn = nextKana && nextKana === 'ん';
      if (isLast || isAgyo || isN || isY || isNa || isYa || isNn) {
        // n単独を除外（nn/xnのみ許可）
        result[i].alternatives = result[i].alternatives.filter(a => a !== 'n');
      }
      // n'は従来通り追加
      if (!isLast && (isAgyo || isN || isY)) {
        if (!result[i].alternatives.includes("n'")) {
          result[i].alternatives.push("n'");
        }
      }
    }
  }
  
  return result;
};

/**
 * ローマ字の文字列のみを取得
 */
export const getRomajiString = (hiragana: string): string => {
  return convertHiraganaToRomaji(hiragana)
    .map(item => item.romaji)
    .join('');
};

/**
 * すべての代替入力パターンを含むオブジェクトを取得
 */
export const getAllRomajiPatterns = (hiragana: string): Array<{
  kana: string;
  romaji: string;
  alternatives: string[];
}> => {
  return convertHiraganaToRomaji(hiragana);
};

/**
 * 記号の全角・半角・shift入力を同一視する正規化関数
 */
export function normalizeSymbol(char: string): string {
  // 全角→半角変換テーブル（重複キーなし）
  const zenkakuToHankaku: Record<string, string> = {
    '？': '?',
    '！': '!',
    '。': '.',
    '、': ',',
    '：': ':',
    '；': ';',
    '（': '(',
    '）': ')',
    '［': '[',
    '］': ']',
    '｛': '{',
    '｝': '}',
    'ー': '-',
    '・': '/',
    '／': '/',
    '￥': '\\',
    '　': ' ',
    '〜': '~',
    '＝': '=',
    '＋': '+',
    '＊': '*',
    '＠': '@',
    '＃': '#',
    '％': '%',
    '＆': '&',
    '＿': '_',
    '＾': '^',    '｜': '|',
    '＜': '<',
    '＞': '>',
    '，': ',',
    '．': '.',
    '｀': '`',
    '＄': '$',
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
  };
  if (zenkakuToHankaku[char]) return zenkakuToHankaku[char];
  // 「/」と「?」は区別する（shift + / で ? を入力できるように）
  // 何も変換せずそのまま返す
  return char;
}

/**
 * hiraganaToRomaji alias for convertHiraganaToRomaji
 */
export const hiraganaToRomaji = convertHiraganaToRomaji;
