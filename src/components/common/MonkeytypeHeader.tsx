import Image from 'next/image';
import styles from '@/styles/MonkeytypeHeader.module.css';

const MonkeytypeHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={40}
          height={40}
          className={styles.logoImage}
          priority
        />
        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>manabytype</span>
        </div>
      </div>
      <div className={styles.iconGroup}></div>
    </header>
  );
};

export default MonkeytypeHeader;
