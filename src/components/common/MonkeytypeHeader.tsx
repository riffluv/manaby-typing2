import Image from 'next/image';
import { IoSettings, IoInformationCircle } from 'react-icons/io5';
import { MdKeyboard } from 'react-icons/md';

const MonkeytypeHeader = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={40}
          height={40}
          className="logo-image"
          priority
        />
        <div className="logo-text-container">
          <span className="logo-text">manabytype</span>
        </div>
      </div>      <div className="icon-group">
        {/* キーボードアイコン */}
        <button className="header-icon-btn" title="キーボード設定">
          <MdKeyboard className="header-icon" />
        </button>
        {/* クレジットアイコン */}
        <button className="header-icon-btn" title="クレジット・情報">
          <IoInformationCircle className="header-icon" />
        </button>
        {/* 設定アイコン */}
        <button className="header-icon-btn" title="設定">
          <IoSettings className="header-icon" />
        </button>
      </div>
    </header>
  );
};

export default MonkeytypeHeader;
