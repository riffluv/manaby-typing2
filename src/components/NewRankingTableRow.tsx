import { motion } from 'framer-motion';
import styles from '@/styles/NewRankingScreen.module.css';

interface NewRankingTableRowProps {
  entry: {
    name: string;
    kpm: number;
    accuracy: number;
    correct: number;
    miss: number;
  };
  index: number;
}

const NewRankingTableRow: React.FC<NewRankingTableRowProps> = ({ entry, index }) => (
  <motion.tr 
    key={index}
    className={`
      ${styles.tableRow} 
      ${styles.fadeIn}
      ${index < 3 ? styles.tableRowTop3 : ''}
      ${index === 0 ? styles.tableRowFirst : ''}
      ${index === 1 ? styles.tableRowSecond : ''}
      ${index === 2 ? styles.tableRowThird : ''}
    `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
  >
    <td className={`${styles.tableCell} ${styles.rankCell} ${
      index === 0 ? styles.rankCellFirst :
      index === 1 ? styles.rankCellSecond :
      index === 2 ? styles.rankCellThird : ''
    }`}>
      {index === 0 ? '🏆 1st' :
       index === 1 ? '🥈 2nd' :
       index === 2 ? '🥉 3rd' :
       `${index + 1}`}
    </td>
    <td className={`${styles.tableCell} ${styles.nameCell}`}>{entry.name}</td>
    <td className={`${styles.tableCell} ${styles.kpmCell}`}>{entry.kpm}</td>
    <td className={`${styles.tableCell} ${styles.accuracyCell}`}>{entry.accuracy}%</td>
    <td className={`${styles.tableCell} ${styles.correctCell}`}>{entry.correct}</td>
    <td className={`${styles.tableCell} ${styles.missCell}`}>{entry.miss}</td>
  </motion.tr>
);

export default NewRankingTableRow;
