import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

// 与 Header.tsx 一致：走 BASE_URL，部署到子路径时也不会断
const nailongLogo = `${import.meta.env.BASE_URL}cityu-nailoong.jpg`;

/** 彩蛋页专属页头：品牌换成 CityU Playground，并提供回 Hub 的入口 */
export function PlaygroundHeader() {
  const { t } = useI18n();

  return (
    <header className="pg-header">
      <div className="pg-header-inner">
        <Link to="/playground" className="pg-brand">
          <img
            src={nailongLogo}
            alt={t('playground.logoAlt')}
            width={56}
            height={56}
            className="pg-logo"
          />
          <span className="flex flex-col gap-1.5 leading-none">
            <span className="pg-brand-title pixel text-[13px] font-bold sm:text-[16px]">
              {t('playground.brand')}
            </span>
            <span className="mono text-[11px] sm:text-[13px]">
              {t('playground.tagline')}
            </span>
          </span>
        </Link>

        {/* 需求 6：随时能回 Hub */}
        <Link to="/" className="pg-back">
          <span aria-hidden>←</span>
          {t('playground.back')}
        </Link>
      </div>
    </header>
  );
}
