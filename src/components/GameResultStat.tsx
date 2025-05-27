import { motion } from 'framer-motion';
import styles from '@/styles/ModernGameResult.module.css';

interface GameResultStatProps {
  label: string;
  value: number;
  valueClass?: string;
  custom: number;
  showContent: boolean;
  statVariants: any;
}

const GameResultStat: React.FC<GameResultStatProps> = ({ label, value, valueClass = '', custom, showContent, statVariants }) => (
  <motion.div 
    className={styles.statCard}
    custom={custom}
    initial="hidden"
    animate={showContent ? "visible" : "hidden"}
    variants={statVariants}
  >
    <div className={styles.statLabel}>{label}</div>
    <div className={`${styles.statValue} ${valueClass}`}>
      <span className={styles.countNumber}>{value}</span>
      {label === 'accuracy' && '%'}
    </div>
  </motion.div>
);

export default GameResultStat;
