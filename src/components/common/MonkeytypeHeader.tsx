import Image from 'next/image';
import { FiSettings, FiInfo, FiBarChart2, FiUser, FiMonitor } from 'react-icons/fi';
import { Geist_Mono } from 'next/font/google';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const icons = [FiMonitor, FiBarChart2, FiInfo, FiSettings, FiUser];

const MonkeytypeHeader = () => {
  return (
    <header
      className="fixed z-50 flex items-center"
      style={{ top: '1.5rem', left: '1.5rem', right: 'auto', pointerEvents: 'none', minWidth: '320px' }}
    >
      {/* ロゴ＋タイトルを一体感ある横並びで（背景色なし） */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-1 shadow-lg pointer-events-auto" style={{ backdropFilter: 'blur(2px)' }}>
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={34}
          height={34}
          className="rounded-md shadow"
          priority
        />
        <span
          className="font-mono font-black text-2xl lg:text-3xl tracking-tight drop-shadow-sm select-none"
          style={{ letterSpacing: '-0.04em' }}
        >
          manabytype
        </span>
      </div>
      {/* タイトルとアイコン群の間に大きめの余白 */}
      <div style={{ width: '2.5rem' }} />
      {/* アイコン群は右端に寄せてバランスよく配置（背景色なし） */}
      <div className="flex items-center gap-4 md:gap-5 rounded-xl px-2 py-1 shadow pointer-events-auto" style={{ backdropFilter: 'blur(2px)' }}>
        {icons.map((Icon, i) => (
          <span key={i} className="hover:text-amber-400 transition-colors duration-150 cursor-pointer">
            <Icon className="text-[28px]" />
          </span>
        ))}
      </div>
    </header>
  );
};

export default MonkeytypeHeader;
