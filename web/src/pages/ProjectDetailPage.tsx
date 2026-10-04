import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ExternalLink, Eye, GitFork, Scale, Star, Tag } from 'lucide-react';
import { fetchStats, trackProjectEvent, type SiteStats } from '../api/stats';
import { BadgeSnippet } from '../components/BadgeSnippet';
import { EmptyState } from '../components/EmptyState';
import { GitHubIcon } from '../components/GitHubIcon';
import { Header } from '../components/Header';
import { HeatPanel } from '../components/HeatPanel';
import { RelatedProjects } from '../components/RelatedProjects';
import { SkeletonCard } from '../components/SkeletonCard';
import { TagChips } from '../components/TagChips';
import { useProject } from '../hooks/useProjects';
import { localizeProject, useI18n } from '../i18n';
import { avatarUrl } from '../utils/avatar';
import { formatNumber, formatRelativeTime } from '../utils/formatNumber';
import { languageColor } from '../utils/language';
import { setRouteMeta } from '../utils/seo';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { project, loading, error } = useProject(id);

  // 按当前语言摊平项目文本；切换语言时重算，确保标题/简介/README 即时更新
  const text = useMemo(() => (project ? localizeProject(project, lang) : null), [project, lang]);

  useEffect(() => {
    if (!project || !text) return;
    setRouteMeta({
      title: t('detail.meta.title', { name: text.name }),
      description: (
        text.about ||
        text.description ||
        t('detail.meta.fallback', {
          name: text.name,
          author: project.authorName || project.author,
        })
      ).slice(0, 150),
      path: `/project/${project.id}`,
    });
  }, [project, text, t, lang]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const avatar = avatarUrl(project?.authorAvatar, project?.repo);

  // 站内统计：浏览埋点 + 该项目的聚合数据（用于热力拆解）
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    if (!project) return;
    trackProjectEvent('view', project.id);

    let alive = true;
    void fetchStats([project.id]).then((result) => {
      if (alive) setStats(result);
    });
    return () => {
      alive = false;
    };
  }, [project]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <button type="button" onClick={goBack} className="btn-brutal btn-brutal-secondary">
          <ArrowLeft className="size-4" />
          {t('detail.back')}
        </button>

        {loading && (
          <div className="mt-6 grid gap-6">
            <SkeletonCard />
          </div>
        )}

        {!loading && (error || !project) && (
          <div className="mt-6">
            <EmptyState
              title={t('detail.notFound.title')}
              description={error ?? t('detail.notFound.description')}
              actionLabel={t('detail.notFound.action')}
              onAction={() => navigate('/')}
            />
          </div>
        )}

        {!loading && project && (
          <>
            <article className="panel-brutal mt-6 p-6">
              <div className="flex items-center gap-2">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={t('sidebar.avatarAlt', { name: project.authorName || project.author })}
                    loading="lazy"
                    width={28}
                    height={28}
                    className="size-7 border-2 border-line bg-elevated object-cover"
                  />
                ) : (
                  <span className="pixel grid size-7 shrink-0 place-items-center border-2 border-line bg-elevated text-[8px] text-ink uppercase">
                    {project.author.slice(0, 1)}
                  </span>
                )}
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="mono truncate text-[12px] text-ink">{project.author}</span>
                  {(() => {
                    const meta = [
                      project.authorName && project.authorName !== project.author
                        ? project.authorName
                        : '',
                      text?.major,
                      project.enrollmentYear
                        ? t('card.yearLevel', { year: project.enrollmentYear })
                        : '',
                    ].filter(Boolean);
                    if (meta.length === 0) return null;
                    return (
                      <span className="mono truncate text-[11px] text-muted">
                        {meta.join(' · ')}
                      </span>
                    );
                  })()}
                </span>
                <span className="mono text-[12px] text-muted">//</span>
                <Link
                  to={`/?q=author:${encodeURIComponent(project.author)}`}
                  className="mono text-[12px] text-muted hover:text-brand"
                >
                  {project.repo}
                </Link>
                <span className="pixel ml-auto border-2 border-accent px-2 py-1 text-[8px] text-accent">
                  SRC
                </span>
              </div>

              <h1 className="glitch mt-4 text-3xl font-black tracking-tight text-ink">
                {text?.name}
              </h1>
              {/* 简介取对应 GitHub 仓库的 About，仓库没写就是空白 */}
              {project.about && (
                <p className="mono mt-3 text-[13px] leading-6 text-muted">{text?.about}</p>
              )}

              {(project.authorName || project.major || project.enrollmentYear) && (
                <dl className="mono mt-4 grid gap-2 border-l-4 border-brand pl-3 text-[12px] text-muted sm:grid-cols-3">
                  {project.authorName && (
                    <div>
                      <dt className="text-[10px] text-ink">{t('detail.meta.name')}</dt>
                      <dd>{project.authorName}</dd>
                    </div>
                  )}
                  {project.major && (
                    <div>
                      <dt className="text-[10px] text-ink">{t('detail.meta.major')}</dt>
                      <dd>{text?.major}</dd>
                    </div>
                  )}
                  {project.enrollmentYear && (
                    <div>
                      <dt className="text-[10px] text-ink">{t('detail.meta.year')}</dt>
                      <dd>{project.enrollmentYear}</dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => trackProjectEvent('click', project.id)}
                  className="btn-brutal btn-brutal-primary"
                >
                  <Star className="size-4" />
                  Star on GitHub
                </a>
                <a
                  href={`${project.githubUrl}?tab=readme-ov-file#readme`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => trackProjectEvent('click', project.id)}
                  className="btn-brutal btn-brutal-secondary"
                >
                  <GitHubIcon className="size-4" />
                  {t('detail.viewRepo')}
                </a>
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-brutal btn-brutal-plasma"
                  >
                    <ExternalLink className="size-4" />
                    DEMO
                  </a>
                )}
                {project.hasRelease && (
                  <a
                    href={`${project.githubUrl}/releases`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-brutal btn-brutal-release"
                  >
                    <Tag className="size-4" />
                    RELEASE
                  </a>
                )}
              </div>

              <p className="mono mt-3 max-w-2xl text-[11px] leading-5 text-muted">
                {t('detail.encourage')}
              </p>

              <dl className="mono mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t-[3px] border-line pt-4 text-[12px] text-muted sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Star className="size-3.5 text-brand" />
                  <dt className="sr-only">{t('detail.sr.stars')}</dt>
                  <dd className="text-brand tabular-nums">{formatNumber(project.stars)} stars</dd>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="size-3.5" />
                  <dt className="sr-only">{t('detail.sr.forks')}</dt>
                  <dd className="tabular-nums">{formatNumber(project.forks)} forks</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="size-3.5" />
                  <dt className="sr-only">{t('detail.sr.license')}</dt>
                  <dd>{project.license || '—'}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 border border-line"
                    style={{ backgroundColor: languageColor(project.language) }}
                  />
                  <dt className="sr-only">{t('detail.sr.language')}</dt>
                  <dd>{project.language || '—'}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5" />
                  <dt className="sr-only">{t('detail.sr.created')}</dt>
                  <dd>{t('detail.createdAt', { date: project.createdAt })}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5" />
                  <dt className="sr-only">{t('detail.sr.updated')}</dt>
                  <dd>{t('detail.updatedAt', { time: formatRelativeTime(project.updatedAt, t) })}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <span className="border-2 border-line px-2 py-0.5">{text?.category}</span>
                </div>
                {/* 该项目的站内浏览量：要配了 Upstash 才有值 */}
                <div className="flex items-center gap-2">
                  <Eye className="size-3.5" />
                  <dt className="sr-only">{t('detail.sr.views')}</dt>
                  <dd className="tabular-nums">
                    {t('detail.views', {
                      count: formatNumber(stats?.projects[project.id]?.views ?? 0),
                    })}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t-[3px] border-line pt-5">
                <TagChips items={project.tags} size="md" />
              </div>
            </article>

            <section className="panel-brutal mt-6 p-6 sm:p-8">
              <h2 className="pixel flex items-center gap-3 text-[10px] text-muted">
                <span className="size-3 bg-brand" />
                README.md
              </h2>
              <div
                className="prose-readme mt-5"
                // mock 阶段直接渲染本地数据里的 README 片段
                dangerouslySetInnerHTML={{
                  __html: text?.readmeHtml || `<p>${t('detail.readmeEmpty')}</p>`,
                }}
              />
            </section>

            <HeatPanel project={project} stats={stats?.projects[project.id]} />

            <RelatedProjects current={project} />

            <BadgeSnippet id={project.id} />
          </>
        )}
      </main>
    </div>
  );
}
