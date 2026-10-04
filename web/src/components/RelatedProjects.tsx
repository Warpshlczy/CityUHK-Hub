import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../api/projects';
import { localizeProject, useI18n } from '../i18n';
import type { Project } from '../types';

/** 内链区块：同作者的其他项目 + 共享标签的相关项目 */
export function RelatedProjects({ current }: { current: Project }) {
  const { lang, t } = useI18n();
  const [all, setAll] = useState<Project[]>([]);

  useEffect(() => {
    let alive = true;
    // 列表在 api/projects 内部有缓存，从首页点进来的话不会再发请求
    fetchProjects()
      .then((res) => {
        if (alive) setAll(res.projects);
      })
      .catch(() => {
        /* 拿不到列表就不展示这一块，不影响正文 */
      });
    return () => {
      alive = false;
    };
  }, []);

  const others = all.filter((project) => project.id !== current.id);
  const byAuthor = others.filter((project) => project.author === current.author).slice(0, 4);
  const byTags = others
    .filter((project) => project.author !== current.author)
    .map((project) => ({
      project,
      shared: project.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter((item) => item.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 4)
    .map((item) => item.project);

  if (byAuthor.length === 0 && byTags.length === 0) return null;

  return (
    <section className="panel-brutal mt-6 p-6">
      <h2 className="pixel flex items-center gap-3 text-[10px] text-muted">
        <span className="size-3 bg-brand" />
        {t('related.heading')}
      </h2>

      {byAuthor.length > 0 && (
        <div className="mt-4">
          <h3 className="mono text-[11px] text-ink">
            {t('related.byAuthor', { name: current.authorName || current.author })}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {byAuthor.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/project/${project.id}`}
                  className="mono flex items-baseline gap-2 text-[12px] text-muted transition-colors hover:text-brand"
                >
                  <span className="min-w-0 truncate text-ink">{localizeProject(project, lang).name}</span>
                  <span className="shrink-0 text-[10px]">★ {project.stars}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {byTags.length > 0 && (
        <div className="mt-4">
          <h3 className="mono text-[11px] text-ink">{t('related.byTags')}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {byTags.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/project/${project.id}`}
                  className="chip-brutal px-2 py-1 text-[11px]"
                >
                  {localizeProject(project, lang).name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
