// Typingゲームで使う型定義を集約
import { TypingChar } from '@/utils/japaneseUtils';

export type TypingWord = {
  japanese: string;
  hiragana: string;
  romaji: string;
  typingChars: TypingChar[];
  displayChars: string[];
};

export type KanaDisplay = {
  acceptedText: string;
  remainingText: string;
  displayText: string;
};
