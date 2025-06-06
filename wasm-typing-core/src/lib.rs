use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Console.logマクロ (デバッグ用)
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// パニックフックの設定
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    Ok(())
}

// ローマ字変換結果の構造体
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RomajiData {
    pub kana: String,
    pub alternatives: Vec<String>,
}

// WebAssembly関数群
#[wasm_bindgen]
pub struct WasmTypingCore {
    romaji_map: HashMap<String, Vec<String>>,
}

#[wasm_bindgen]
impl WasmTypingCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmTypingCore {
        let mut core = WasmTypingCore {
            romaji_map: HashMap::new(),
        };
        core.initialize_romaji_map();
        core
    }

    // 日本語→ローマ字変換のメイン関数
    #[wasm_bindgen]
    pub fn convert_to_romaji(&self, hiragana: &str) -> JsValue {
        let result = self.internal_convert_to_romaji(hiragana);
        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }

    // 高速文字マッチング判定
    #[wasm_bindgen]
    pub fn match_character(&self, input_char: &str, target_alternatives: &JsValue) -> bool {
        let alternatives: Vec<String> = serde_wasm_bindgen::from_value(target_alternatives.clone())
            .unwrap_or_default();
        
        for alt in alternatives {
            if alt.starts_with(input_char) {
                return true;
            }
        }
        false
    }

    // 「ん」文字の特殊パターン生成
    #[wasm_bindgen]
    pub fn get_n_patterns(&self, next_char: Option<String>) -> JsValue {
        let patterns = self.internal_get_n_patterns(next_char.as_deref());
        serde_wasm_bindgen::to_value(&patterns).unwrap_or(JsValue::NULL)
    }

    // バッチ処理: 複数の文字列を一度に変換
    #[wasm_bindgen]
    pub fn batch_convert(&self, hiragana_list: &JsValue) -> JsValue {
        let list: Vec<String> = serde_wasm_bindgen::from_value(hiragana_list.clone())
            .unwrap_or_default();
        
        let results: Vec<Vec<RomajiData>> = list
            .iter()
            .map(|h| self.internal_convert_to_romaji(h))
            .collect();
        
        serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL)
    }
}

// 内部実装メソッド
impl WasmTypingCore {
    fn initialize_romaji_map(&mut self) {
        // 基本ひらがな
        self.romaji_map.insert("あ".to_string(), vec!["a".to_string()]);
        self.romaji_map.insert("い".to_string(), vec!["i".to_string(), "yi".to_string()]);
        self.romaji_map.insert("う".to_string(), vec!["u".to_string(), "wu".to_string()]);
        self.romaji_map.insert("え".to_string(), vec!["e".to_string()]);
        self.romaji_map.insert("お".to_string(), vec!["o".to_string()]);
        
        // か行
        self.romaji_map.insert("か".to_string(), vec!["ka".to_string(), "ca".to_string()]);
        self.romaji_map.insert("き".to_string(), vec!["ki".to_string()]);
        self.romaji_map.insert("く".to_string(), vec!["ku".to_string(), "cu".to_string(), "qu".to_string()]);
        self.romaji_map.insert("け".to_string(), vec!["ke".to_string()]);
        self.romaji_map.insert("こ".to_string(), vec!["ko".to_string(), "co".to_string()]);
        self.romaji_map.insert("が".to_string(), vec!["ga".to_string()]);
        self.romaji_map.insert("ぎ".to_string(), vec!["gi".to_string()]);
        self.romaji_map.insert("ぐ".to_string(), vec!["gu".to_string()]);
        self.romaji_map.insert("げ".to_string(), vec!["ge".to_string()]);
        self.romaji_map.insert("ご".to_string(), vec!["go".to_string()]);
        
        // さ行
        self.romaji_map.insert("さ".to_string(), vec!["sa".to_string()]);
        self.romaji_map.insert("し".to_string(), vec!["si".to_string(), "shi".to_string(), "ci".to_string()]);
        self.romaji_map.insert("す".to_string(), vec!["su".to_string()]);
        self.romaji_map.insert("せ".to_string(), vec!["se".to_string(), "ce".to_string()]);
        self.romaji_map.insert("そ".to_string(), vec!["so".to_string()]);
        self.romaji_map.insert("ざ".to_string(), vec!["za".to_string()]);
        self.romaji_map.insert("じ".to_string(), vec!["ji".to_string(), "zi".to_string()]);
        self.romaji_map.insert("ず".to_string(), vec!["zu".to_string()]);
        self.romaji_map.insert("ぜ".to_string(), vec!["ze".to_string()]);
        self.romaji_map.insert("ぞ".to_string(), vec!["zo".to_string()]);
        
        // た行
        self.romaji_map.insert("た".to_string(), vec!["ta".to_string()]);
        self.romaji_map.insert("ち".to_string(), vec!["ti".to_string(), "chi".to_string()]);
        self.romaji_map.insert("つ".to_string(), vec!["tu".to_string(), "tsu".to_string()]);
        self.romaji_map.insert("て".to_string(), vec!["te".to_string()]);
        self.romaji_map.insert("と".to_string(), vec!["to".to_string()]);
        self.romaji_map.insert("だ".to_string(), vec!["da".to_string()]);
        self.romaji_map.insert("ぢ".to_string(), vec!["di".to_string()]);
        self.romaji_map.insert("づ".to_string(), vec!["du".to_string()]);
        self.romaji_map.insert("で".to_string(), vec!["de".to_string()]);
        self.romaji_map.insert("ど".to_string(), vec!["do".to_string()]);
        
        // な行
        self.romaji_map.insert("な".to_string(), vec!["na".to_string()]);
        self.romaji_map.insert("に".to_string(), vec!["ni".to_string()]);
        self.romaji_map.insert("ぬ".to_string(), vec!["nu".to_string()]);
        self.romaji_map.insert("ね".to_string(), vec!["ne".to_string()]);
        self.romaji_map.insert("の".to_string(), vec!["no".to_string()]);
        
        // は行
        self.romaji_map.insert("は".to_string(), vec!["ha".to_string()]);
        self.romaji_map.insert("ひ".to_string(), vec!["hi".to_string()]);
        self.romaji_map.insert("ふ".to_string(), vec!["fu".to_string(), "hu".to_string()]);
        self.romaji_map.insert("へ".to_string(), vec!["he".to_string()]);
        self.romaji_map.insert("ほ".to_string(), vec!["ho".to_string()]);
        self.romaji_map.insert("ば".to_string(), vec!["ba".to_string()]);
        self.romaji_map.insert("び".to_string(), vec!["bi".to_string()]);
        self.romaji_map.insert("ぶ".to_string(), vec!["bu".to_string()]);
        self.romaji_map.insert("べ".to_string(), vec!["be".to_string()]);
        self.romaji_map.insert("ぼ".to_string(), vec!["bo".to_string()]);
        self.romaji_map.insert("ぱ".to_string(), vec!["pa".to_string()]);
        self.romaji_map.insert("ぴ".to_string(), vec!["pi".to_string()]);
        self.romaji_map.insert("ぷ".to_string(), vec!["pu".to_string()]);
        self.romaji_map.insert("ぺ".to_string(), vec!["pe".to_string()]);
        self.romaji_map.insert("ぽ".to_string(), vec!["po".to_string()]);
        
        // ま行
        self.romaji_map.insert("ま".to_string(), vec!["ma".to_string()]);
        self.romaji_map.insert("み".to_string(), vec!["mi".to_string()]);
        self.romaji_map.insert("む".to_string(), vec!["mu".to_string()]);
        self.romaji_map.insert("め".to_string(), vec!["me".to_string()]);
        self.romaji_map.insert("も".to_string(), vec!["mo".to_string()]);
        
        // や行
        self.romaji_map.insert("や".to_string(), vec!["ya".to_string()]);
        self.romaji_map.insert("ゆ".to_string(), vec!["yu".to_string()]);
        self.romaji_map.insert("よ".to_string(), vec!["yo".to_string()]);
        
        // ら行
        self.romaji_map.insert("ら".to_string(), vec!["ra".to_string()]);
        self.romaji_map.insert("り".to_string(), vec!["ri".to_string()]);
        self.romaji_map.insert("る".to_string(), vec!["ru".to_string()]);
        self.romaji_map.insert("れ".to_string(), vec!["re".to_string()]);
        self.romaji_map.insert("ろ".to_string(), vec!["ro".to_string()]);
        
        // わ行
        self.romaji_map.insert("わ".to_string(), vec!["wa".to_string()]);
        self.romaji_map.insert("ゐ".to_string(), vec!["wyi".to_string()]);
        self.romaji_map.insert("ゑ".to_string(), vec!["wye".to_string()]);
        self.romaji_map.insert("を".to_string(), vec!["wo".to_string()]);
        self.romaji_map.insert("ん".to_string(), vec!["nn".to_string(), "xn".to_string(), "n".to_string()]);
        
        // 拗音の追加
        self.add_yoon_patterns();
        
        // 特殊パターンの追加
        self.add_special_patterns();
    }
    
    fn add_yoon_patterns(&mut self) {
        // きゃ行
        self.romaji_map.insert("きゃ".to_string(), vec!["kya".to_string()]);
        self.romaji_map.insert("きぃ".to_string(), vec!["kyi".to_string()]);
        self.romaji_map.insert("きゅ".to_string(), vec!["kyu".to_string()]);
        self.romaji_map.insert("きぇ".to_string(), vec!["kye".to_string()]);
        self.romaji_map.insert("きょ".to_string(), vec!["kyo".to_string()]);
        
        // しゃ行
        self.romaji_map.insert("しゃ".to_string(), vec!["sya".to_string(), "sha".to_string()]);
        self.romaji_map.insert("しぃ".to_string(), vec!["syi".to_string()]);
        self.romaji_map.insert("しゅ".to_string(), vec!["syu".to_string(), "shu".to_string()]);
        self.romaji_map.insert("しぇ".to_string(), vec!["sye".to_string(), "she".to_string()]);
        self.romaji_map.insert("しょ".to_string(), vec!["syo".to_string(), "sho".to_string()]);
        
        // ちゃ行
        self.romaji_map.insert("ちゃ".to_string(), vec!["tya".to_string(), "cha".to_string()]);
        self.romaji_map.insert("ちぃ".to_string(), vec!["tyi".to_string()]);
        self.romaji_map.insert("ちゅ".to_string(), vec!["tyu".to_string(), "chu".to_string()]);
        self.romaji_map.insert("ちぇ".to_string(), vec!["tye".to_string(), "che".to_string()]);
        self.romaji_map.insert("ちょ".to_string(), vec!["tyo".to_string(), "cho".to_string()]);
        
        // にゃ行
        self.romaji_map.insert("にゃ".to_string(), vec!["nya".to_string()]);
        self.romaji_map.insert("にぃ".to_string(), vec!["nyi".to_string()]);
        self.romaji_map.insert("にゅ".to_string(), vec!["nyu".to_string()]);
        self.romaji_map.insert("にぇ".to_string(), vec!["nye".to_string()]);
        self.romaji_map.insert("にょ".to_string(), vec!["nyo".to_string()]);
        
        // ひゃ行
        self.romaji_map.insert("ひゃ".to_string(), vec!["hya".to_string()]);
        self.romaji_map.insert("ひぃ".to_string(), vec!["hyi".to_string()]);
        self.romaji_map.insert("ひゅ".to_string(), vec!["hyu".to_string()]);
        self.romaji_map.insert("ひぇ".to_string(), vec!["hye".to_string()]);
        self.romaji_map.insert("ひょ".to_string(), vec!["hyo".to_string()]);
        
        // みゃ行
        self.romaji_map.insert("みゃ".to_string(), vec!["mya".to_string()]);
        self.romaji_map.insert("みぃ".to_string(), vec!["myi".to_string()]);
        self.romaji_map.insert("みゅ".to_string(), vec!["myu".to_string()]);
        self.romaji_map.insert("みぇ".to_string(), vec!["mye".to_string()]);
        self.romaji_map.insert("みょ".to_string(), vec!["myo".to_string()]);
        
        // りゃ行
        self.romaji_map.insert("りゃ".to_string(), vec!["rya".to_string()]);
        self.romaji_map.insert("りぃ".to_string(), vec!["ryi".to_string()]);
        self.romaji_map.insert("りゅ".to_string(), vec!["ryu".to_string()]);
        self.romaji_map.insert("りぇ".to_string(), vec!["rye".to_string()]);
        self.romaji_map.insert("りょ".to_string(), vec!["ryo".to_string()]);
    }
    
    fn add_special_patterns(&mut self) {
        // ふぁ行
        self.romaji_map.insert("ふぁ".to_string(), vec!["fa".to_string()]);
        self.romaji_map.insert("ふぃ".to_string(), vec!["fi".to_string()]);
        self.romaji_map.insert("ふぇ".to_string(), vec!["fe".to_string()]);
        self.romaji_map.insert("ふぉ".to_string(), vec!["fo".to_string()]);
        
        // ヴ系
        self.romaji_map.insert("ヴぁ".to_string(), vec!["va".to_string()]);
        self.romaji_map.insert("ヴぃ".to_string(), vec!["vi".to_string()]);
        self.romaji_map.insert("ヴ".to_string(), vec!["vu".to_string()]);
        self.romaji_map.insert("ヴぇ".to_string(), vec!["ve".to_string()]);
        self.romaji_map.insert("ヴぉ".to_string(), vec!["vo".to_string()]);
        
        // くぁ行
        self.romaji_map.insert("くぁ".to_string(), vec!["qa".to_string(), "qwa".to_string()]);
        self.romaji_map.insert("くぃ".to_string(), vec!["qi".to_string(), "qwi".to_string()]);
        self.romaji_map.insert("くぇ".to_string(), vec!["qe".to_string(), "qwe".to_string()]);
        self.romaji_map.insert("くぉ".to_string(), vec!["qo".to_string(), "qwo".to_string()]);
    }

    fn internal_convert_to_romaji(&self, hiragana: &str) -> Vec<RomajiData> {
        let chars: Vec<char> = hiragana.chars().collect();
        let mut result = Vec::new();
        let mut i = 0;

        while i < chars.len() {
            let char = chars[i].to_string();

            // っ（促音）の特殊処理
            if char == "っ" {
                if i + 1 < chars.len() {
                    let next_char = chars[i + 1].to_string();
                    if let Some(next_romaji) = self.romaji_map.get(&next_char) {
                        if let Some(first_romaji) = next_romaji.first() {
                            let consonant = first_romaji.chars().next().unwrap().to_string();
                            result.push(RomajiData {
                                kana: char,
                                alternatives: vec![consonant, "xtu".to_string(), "ltu".to_string()],
                            });
                        }
                    }
                } else {
                    result.push(RomajiData {
                        kana: char,
                        alternatives: vec!["xtu".to_string(), "ltu".to_string(), "xtsu".to_string(), "ltsu".to_string()],
                    });
                }
                i += 1;
                continue;
            }

            // ん（撥音）の特殊処理
            if char == "ん" {
                let next_char = if i + 1 < chars.len() {
                    Some(chars[i + 1].to_string())
                } else {
                    None
                };
                let n_patterns = self.internal_get_n_patterns(next_char.as_deref());
                result.push(RomajiData {
                    kana: char,
                    alternatives: n_patterns,
                });
                i += 1;
                continue;
            }

            // 2文字の拗音チェック
            if i + 1 < chars.len() {
                let two_char = format!("{}{}", chars[i], chars[i + 1]);
                if let Some(alternatives) = self.romaji_map.get(&two_char) {
                    result.push(RomajiData {
                        kana: two_char,
                        alternatives: alternatives.clone(),
                    });
                    i += 2;
                    continue;
                }
            }

            // 通常の単文字処理
            if let Some(alternatives) = self.romaji_map.get(&char) {
                result.push(RomajiData {
                    kana: char,
                    alternatives: alternatives.clone(),
                });
            } else {
                // 未定義文字はそのまま
                result.push(RomajiData {
                    kana: char.clone(),
                    alternatives: vec![char],
                });
            }
            i += 1;
        }

        result
    }

    fn internal_get_n_patterns(&self, next_char: Option<&str>) -> Vec<String> {
        let Some(next_char) = next_char else {
            return vec!["nn".to_string(), "xn".to_string(), "n".to_string()];
        };

        let Some(next_romaji) = self.romaji_map.get(next_char) else {
            return vec!["nn".to_string(), "xn".to_string(), "n".to_string()];
        };

        let Some(first_romaji) = next_romaji.first() else {
            return vec!["nn".to_string(), "xn".to_string(), "n".to_string()];
        };

        let first_char = first_romaji.chars().next().unwrap().to_ascii_lowercase();

        // 'y'や'w'で始まる場合は'n'を許可しない
        if first_char == 'y' || first_char == 'w' {
            return vec!["nn".to_string(), "xn".to_string()];
        }

        // 母音で始まる場合は'n'を許可しない
        if ['a', 'i', 'u', 'e', 'o'].contains(&first_char) {
            return vec!["nn".to_string(), "xn".to_string()];
        }

        vec!["nn".to_string(), "xn".to_string(), "n".to_string()]
    }
}
