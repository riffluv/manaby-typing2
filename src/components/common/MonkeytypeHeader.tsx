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
      className="fixed z-50 w-full max-w-xs md:max-w-sm flex items-center gap-2 md:gap-4 p-0 md:p-0 bg-transparent select-none pointer-events-none"
      style={{ top: '1.5rem', left: '1.5rem', right: 'auto', pointerEvents: 'none' }}
    >
      <div className="flex items-center gap-2 pointer-events-auto m-0">
        <Image
          src="/images/manabyicon_01.png"
          alt="manabytype logo"
          width={36}
          height={36}
          className="rounded-md shadow m-0"
          priority
        />
        <span
          className="font-mono font-black text-2xl lg:text-3xl tracking-tight drop-shadow-sm m-0"
        >
          manabytype
        </span>
      </div>
      <div className="flex-1 min-w-[32px]" />
      <div className="flex items-center gap-4 md:gap-6 text-gray-300 text-xl pointer-events-auto m-0">
        {/* アイコン群 */}
        {icons.map((Icon, i) => (
          <span key={i} className="hover:text-amber-400 transition-colors duration-150 cursor-pointer m-0">
            <Icon className="align-middle" />
          </span>
        ))}
      </div>
    </header>
  );
};

export default MonkeytypeHeader;
