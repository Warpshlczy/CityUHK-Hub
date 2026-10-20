import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { NailongCard } from '../components/NailongCard';
import { PlaygroundHeader } from '../components/PlaygroundHeader';
import { isPlaygroundProject } from '../constants/playground';
import { useProjects } from '../hooks/useProjects';
import { useI18n } from '../i18n';
import { usePlayground } from '../playground/PlaygroundContext';
import { setRouteMeta } from '../utils/seo';

/**
 * 彩蛋页 /playground：只展示被打上 NAILONG 的仓库，整页换皮（见 index.css 的 .playground-scope）。
 * 解锁态只存内存，所以刷新后直达这里会被送回首页 —— 也就不会被爬虫收录一个「空壳页」。
 */
export function PlaygroundPage() {
  const { unlocked } = usePlayground();
  const { data, loading } = useProjects();
  const { lang, t } = useI18n();

  const projects = useMemo(
    () => (data?.projects ?? []).filter((project) => isPlaygroundProject(project)),
    [data],
  );

  useEffect(() => {
    if (!unlocked) return;
    setRouteMeta({
      title: t('playground.meta.title'),
      description: t('playground.meta.description'),
      path: '/playground',
      noindex: true,
    });
  }, [unlocked, t, lang]);

  if (!unlocked) return <Navigate to="/" replace />;

  const count = projects.length;
  const banner = [
    t('playground.brand'),
    t('playground.count', { count }),
    t('playground.tagline'),
  ].join('   ✦   ');

  return (
    <div
      className="playground-scope relative z-10 min-h-screen"
      style={
        {
          // 背景照片走 BASE_URL，部署到子路径时也不会 404（见 index.css 的 .playground-scope）
          '--pg-photo': `url(${import.meta.env.BASE_URL}nailongback.jpeg)`,
        } as CSSProperties
      }
    >
      <PlaygroundHeader />

      <div className="pg-marquee">
        <div className="pg-marquee-track pixel text-[9px]">
          <span className="pr-12">{banner}</span>
          <span className="pr-12">{banner}</span>
        </div>
      </div>

      <main className="pg-main">
        <h1 className="pg-title">{t('playground.heading')}</h1>
        <p className="pg-intro mono">{t('playground.intro')}</p>

        {count > 0 ? (
          <div className="pg-grid">
            {projects.map((project, index) => (
              <NailongCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          !loading && (
            <EmptyState
              title={t('playground.empty.title')}
              description={t('playground.empty.description')}
            />
          )
        )}
      </main>

      <footer className="pg-footer">
        <span className="mono text-[11px]">{t('playground.footer')}</span>
        <Link to="/" className="pg-back">
          <span aria-hidden>←</span>
          {t('playground.back')}
        </Link>
      </footer>
    </div>
  );
}
