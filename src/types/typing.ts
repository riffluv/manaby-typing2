// Typingゲームで使う型定義を集約
import { BasicTypingChar } from '@/utils/BasicTypingChar';

export type TypingWord = {
  japanese: string;
  hiragana: string;
  romaji: string;
  typingChars: BasicTypingChar[];
  displayChars: string[];
};

export type KanaDisplay = {
  acceptedText: string;
  remainingText: string;
  displayText: string;
};
