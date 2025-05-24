import React from 'react';
import ScreenWrapper from './common/ScreenWrapper';
import styles from '../styles/RankingScreen.module.css';

const RankingScreen: React.FC = () => {
  return (
    <ScreenWrapper border={false} boxShadow={true} className={styles.rankingScreen}>
      <div className={styles.container}>
        <h1 className={styles.title}>ランキング</h1>
        {/* ランキングの内容をここに追加 */}
      </div>
    </ScreenWrapper>
  );
};

export default RankingScreen;