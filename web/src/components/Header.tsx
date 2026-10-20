import { type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useI18n } from '../i18n';
import { usePlayground } from '../playground/PlaygroundContext';
import { LanguageToggle } from './LanguageToggle';
import { SubmitProject } from './SubmitProject';
import { ThemeToggle } from './ThemeToggle';
import { UsefulLinks } from './UsefulLinks';

const cityuLogo = `${import.meta.env.BASE_URL}cityu2.jpg`;

/** 移动端三连点 logo 的判定窗口 */
const LOGO_TAP_MS = 700;

/** 触屏设备没有黑猫可点，改成连点 logo 进彩蛋页 */
const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// 计数放模块作用域：点前两下会顺带跳回首页，Header 重挂载时组件内的 ref 会被清零
const logoTap = { count: 0, at: 0 };

interface HeaderProps {
  searchSlot?: ReactNode;
  onOpenSidebar?: () => void;
}

export function Header({ searchSlot, onOpenSidebar }: HeaderProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { unlock } = usePlayground();

  /** 触屏端：连点 logo 三次直接进彩蛋页，不必先解锁再走首页入口页签 */
  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isTouchDevice()) return;
    const now = Date.now();
    if (now - logoTap.at > LOGO_TAP_MS) logoTap.count = 0;
    logoTap.count += 1;
    logoTap.at = now;
    if (logoTap.count < 3) return;
    logoTap.count = 0;
    // 第三下接管跳转：先解锁，PlaygroundPage 才不会把这次访问重定向回首页
    event.preventDefault();
    unlock();
    navigate('/playground');
  };

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-line bg-canvas">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-2.5 sm:gap-x-4 sm:gap-y-3 sm:px-6 sm:py-3">
        {/* 移动端筛选按钮。lg:hidden 后的 ! 不能省：.btn-brutal 的 display 与 lg:hidden 权重相同且排在产物 CSS 后面，不加会被盖掉，桌面端也会显示 */}
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label={t('header.openFilters')}
            className="btn-brutal btn-brutal-secondary !p-0 size-11 lg:hidden!"
          >
            <Menu className="size-5" />
          </button>
        )}

        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex shrink-0 items-center gap-2 focus-visible:outline-none sm:gap-3"
        >
          {/* 原图 882×557，靠 w-auto 保持比例不裁切 */}
          <img
            src={cityuLogo}
            alt={t('header.logoAlt')}
            width={120}
            height={72}
            className="glow-pulse h-11 w-auto sm:h-18"
          />
          <span className="flex flex-col gap-1 leading-none sm:gap-1.5">
            <span className="pixel text-[13px] font-bold text-ink [text-shadow:2px_2px_0_rgba(244,124,148,0.7)] sm:text-[16px]">
              CITYUHK&nbsp;HUB
            </span>
            <span className="mono text-[11px] font-bold text-muted sm:text-[14px]">
              {t('header.tagline')}
            </span>
          </span>
        </Link>

        {/* 有搜索栏时移动端独占第二行、桌面端并排；详情页没搜索栏，按钮靠右与 logo 同行 */}
        <div
          className={[
            'flex min-w-0 items-center gap-2',
            searchSlot
              ? 'order-last w-full lg:order-none lg:w-auto lg:flex-1'
              : 'ml-auto',
          ].join(' ')}
        >
          {searchSlot && <div className="min-w-0 flex-1">{searchSlot}</div>}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <SubmitProject />
            <UsefulLinks />
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
