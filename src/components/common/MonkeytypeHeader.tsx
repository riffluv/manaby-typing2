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
    <header className={`${styles.header} preserved-header`}>
      <div className={`${styles.logoContainer} preserved-logo-container`}>
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={34}
          height={34}
          className={`${styles.logoImage} preserved-logo-image`}
          priority
        />        <div className={`${styles.logoTextContainer} preserved-logo-text-container`}>
          <span className={`${styles.logoText} preserved-logo-text`}>manabytype</span>
        </div>
      </div>      <div className={`${styles.iconGroup} preserved-icon-group`}>        {icons.map((Icon, i) => (
          <span key={i} className={`${styles.icon} preserved-icon`}>
            <Icon size={22} className={`${styles.iconSvg} preserved-icon-svg`} />
          </span>
        ))}
      </div>
    </header>
  );
};

export default MonkeytypeHeader;
