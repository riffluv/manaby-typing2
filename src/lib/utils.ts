import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS クラス名を条件付きで結合・マージする関数
 * clsx と tailwind-merge を組み合わせて、重複するクラス名を適切に処理
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
