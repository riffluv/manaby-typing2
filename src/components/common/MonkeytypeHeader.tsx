import Image from 'next/image';
import { FiSettings, FiInfo, FiBarChart2, FiUser, FiMonitor } from 'react-icons/fi';
import { Geist_Mono } from 'next/font/google';
import styles from '@/styles/MonkeytypeHeader.module.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const icons = [FiMonitor, FiBarChart2, FiInfo, FiSettings, FiUser];

const MonkeytypeHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={34}
          height={34}
          className={styles.logoImage}
          priority
        />        <div className={styles.logoTextContainer}>
          <span className={styles.logoText}>manabytype</span>
        </div>
      </div>      <div className={styles.iconGroup}>        {icons.map((Icon, i) => (
          <span key={i} className={styles.icon}>
            <Icon size={22} className={styles.iconSvg} />
          </span>
        ))}
      </div>
    </header>
  );
};

export default MonkeytypeHeader;
