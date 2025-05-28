import Image from 'next/image';

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
      </div>
      <div className="icon-group"></div>
    </header>
  );
};

export default MonkeytypeHeader;
