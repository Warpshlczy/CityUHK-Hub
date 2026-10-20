import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { trackVisit } from './api/stats';
import { PixelPet } from './components/PixelPet';
import { TargetCursor } from './components/TargetCursor';
import { WelcomeDialog } from './components/WelcomeDialog';
import { I18nProvider } from './i18n';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import { PlaygroundProvider } from './playground/PlaygroundContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** 接口不可用或开了 Do Not Track 时内部跳过 */
function SiteAnalytics() {
  useEffect(() => {
    trackVisit();
  }, []);
  return null;
}

// 老链接兼容：旧版用 HashRouter，分享地址形如 /#/project/xxx。
// 改成真实路径后 hash 不再被解析，这里补一次跳转，免得老分享失效。
function LegacyHashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return;
    const path = hash.slice(1).split('?')[0];
    if (!path) return;
    navigate(path, { replace: true });
  }, [navigate]);
  return null;
}

/** 彩蛋页整页走黄色皮肤，光标也跟着换色，免得粉紫两色落在黄底上突兀 */
function SiteCursor() {
  const { pathname } = useLocation();
  const onPlayground = pathname === '/playground';
  return (
    <TargetCursor
      targetSelector="a, button, .cursor-target"
      cursorColor={onPlayground ? '#fcca1c' : '#f47c94'}
      cursorColorOnTarget={onPlayground ? '#a3e635' : '#a855f7'}
    />
  );
}

export default function App() {
  return (
    // 每个项目要有独立真实 URL 才利于爬虫分别收录；深链接刷新由 Vercel rewrite 兜底（见 vercel.json）
    <BrowserRouter>
      {/* Provider 用 useUrlState(?lang=)，必须在 Router 内层 */}
      <I18nProvider>
        {/* 彩蛋解锁态必须包住 PixelPet：黑猫挂在 Routes 之外，要能调 unlock() */}
        <PlaygroundProvider>
          <ScrollToTop />
          <SiteAnalytics />
          <LegacyHashRedirect />
          <SiteCursor />
          <PixelPet />
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* 彩蛋页：未解锁时内部重定向回首页 */}
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {/* 放在路由之外：直接落在详情页分享链接时也要能弹出来 */}
          <WelcomeDialog />
        </PlaygroundProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
