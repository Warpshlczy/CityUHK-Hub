import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, HeartHandshake } from 'lucide-react';
import { useI18n } from '../i18n';

// 首访欢迎弹窗的「不再提示」标记；scripts/update-screenshot.mjs 有同名常量，改动时两处同步
const DISMISS_KEY = 'cityu-hub:welcome-dismissed';

// 有白底的原始 logo；public/cityu-logo.png 是抠底版，暂未用到
const cityuLogo = `${import.meta.env.BASE_URL}cityu2.jpg`;

const BENEFITS: Array<{ emoji: string; titleKey: string; detailKey: string }> = [
  {
    emoji: '🏷️',
    titleKey: 'welcome.b1.title',
    detailKey: 'welcome.b1.detail',
  },
  {
    emoji: '📣',
    titleKey: 'welcome.b2.title',
    detailKey: 'welcome.b2.detail',
  },
  {
    emoji: '🎓',
    titleKey: 'welcome.b3.title',
    detailKey: 'welcome.b3.detail',
  },
  {
    emoji: '🤝',
    titleKey: 'welcome.b4.title',
    detailKey: 'welcome.b4.detail',
  },
];

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    // 隐私模式下 localStorage 会抛错，当作没勾选过
    return false;
  }
}

function writeDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* 存不进去也不影响这次浏览 */
  }
}

/** 首次访问的欢迎弹窗，引导提交项目 */
export function WelcomeDialog() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => !readDismissed());
  const [neverShow, setNeverShow] = useState(false);

  // 提交页本身就是 fork 引导流程，不必再弹欢迎窗
  if (!visible || pathname === '/submit') return null;

  const close = () => {
    if (neverShow) writeDismissed();
    setVisible(false);
  };

  const goSubmit = () => {
    if (neverShow) writeDismissed();
    setVisible(false);
    navigate('/submit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="dialog-backdrop-in absolute inset-0 bg-black/70" onClick={close} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('welcome.aria')}
        className="dialog-panel-in panel-brutal relative my-4 w-full max-w-3xl p-5 sm:p-6"
      >
        <div className="flex flex-col items-center gap-2.5 text-center">
          <img
            src={cityuLogo}
            alt={t('header.logoAlt')}
            width={120}
            height={72}
            className="h-24 w-auto sm:h-32"
          />
          <h2 className="pixel text-[11px] leading-relaxed text-ink sm:text-[13px]">
            {t('welcome.title')}
          </h2>
        </div>

        <p className="mono mt-4 border-l-[3px] border-brand bg-surface px-3 py-2.5 text-[12px] leading-6 text-ink sm:text-[13px]">
          {t('welcome.lead.a')}
          <strong className="text-brand">{t('welcome.lead.b')}</strong>
          {t('welcome.lead.c')}
        </p>

        {/* 一条一行会让弹窗过高，改成两条一行；窄屏只留标题，细节从 sm 起显示 */}
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.titleKey}
              className="flex items-start gap-2.5 border-2 border-line bg-surface px-3 py-2.5"
            >
              <span className="shrink-0 text-[15px] leading-6" aria-hidden>
                {benefit.emoji}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="pixel text-[9px] text-ink">{t(benefit.titleKey)}</span>
                <span className="mono hidden text-[11px] text-muted sm:block">
                  {t(benefit.detailKey)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={goSubmit}
            className="btn-brutal btn-brutal-rainbow w-full sm:w-auto"
          >
            <HeartHandshake className="size-4" />
            {t('welcome.submit')}
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={close}
            className="btn-brutal btn-brutal-secondary w-full sm:w-auto"
          >
            <BookOpen className="size-4" />
            {t('welcome.browse')}
          </button>

          <label className="mono flex cursor-pointer items-center gap-2 text-[11px] text-muted sm:ml-auto">
            <input
              type="checkbox"
              checked={neverShow}
              onChange={(event) => setNeverShow(event.target.checked)}
              className="size-4 shrink-0 accent-brand"
            />
            {t('welcome.neverShow')}
          </label>
        </div>
      </div>
    </div>
  );
}
