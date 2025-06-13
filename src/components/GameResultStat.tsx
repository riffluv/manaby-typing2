import { motion } from 'framer-motion';

import { motion, type Variants } from 'framer-motion';

interface GameResultStatProps {
  label: string;
  value: number;
  valueClass?: string;
  custom: number;
  showContent: boolean;
  statVariants: Variants; // 適切な型を指定
}

const GameResultStat: React.FC<GameResultStatProps> = ({ 
  label, 
  value, 
  valueClass = '', 
  custom, 
  showContent, 
  statVariants 
}) => (
  <motion.div 
    className="stat-card"
    custom={custom}
    initial="hidden"
    animate={showContent ? "visible" : "hidden"}
    variants={statVariants}
  >
    <div className="stat-label">{label.toUpperCase()}</div>
    <div className={`stat-value ${valueClass}`}>
      <span className="count-up-number">{value}</span>
      {label === 'accuracy' && '%'}
    </div>
  </motion.div>
);

export default GameResultStat;
