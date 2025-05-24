/**
 * Framer Motionのアニメーションバリアントを定義した共通ファイル
 * アプリ全体で一貫したアニメーション効果を提供します
 */

// コンテナのフェードイン用バリアント
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

// 子要素の下からフェードイン用バリアント
export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

// テーブル行のアニメーション用バリアント
export const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: custom * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  hover: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    scale: 1.01,
    transition: {
      duration: 0.2
    }
  }
};

// ボタンのホバーとタップ効果
export const buttonVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 }
};
