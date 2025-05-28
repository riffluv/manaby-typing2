import { motion } from 'framer-motion';

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
      table-row 
      ${index < 3 ? 'table-row-top3' : ''}
      ${index === 0 ? 'table-row-first' : ''}
      ${index === 1 ? 'table-row-second' : ''}
      ${index === 2 ? 'table-row-third' : ''}
    `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
  >
    <td className={`table-cell rank-cell ${
      index === 0 ? 'rank-cell-first' :
      index === 1 ? 'rank-cell-second' :
      index === 2 ? 'rank-cell-third' : ''
    }`}>
      {index === 0 ? '🏆 1st' :
       index === 1 ? '🥈 2nd' :
       index === 2 ? '🥉 3rd' :
       `${index + 1}`}
    </td>
    <td className="table-cell name-cell">{entry.name}</td>
    <td className="table-cell kmp-cell">{entry.kpm}</td>
    <td className="table-cell accuracy-cell">{entry.accuracy}%</td>
    <td className="table-cell correct-cell">{entry.correct}</td>
    <td className="table-cell miss-cell">{entry.miss}</td>
  </motion.tr>
);

export default NewRankingTableRow;
