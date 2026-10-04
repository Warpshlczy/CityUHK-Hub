import { useI18n } from '../i18n';
import type { AuthorItem } from '../types';

/** 站内贡献者墙，点头像直达作者 GitHub 主页。 */
export function ContributorWall({ authors }: { authors: AuthorItem[] }) {
  const { t } = useI18n();
  if (authors.length === 0) return null;

  return (
    <section className="panel-brutal p-5">
      <h2 className="pixel flex items-center gap-2 text-[9px] text-muted">
        <span className="size-3 shrink-0 bg-brand" />
        {t('contributors.title', { count: authors.length })}
      </h2>
      <p className="mono mt-2 text-[11px] text-muted">
        {t('contributors.description')}
      </p>

      <ul className="mt-4 flex flex-wrap gap-2.5">
        {authors.map((author) => {
          const githubUser = author.githubUser || author.name;
          return (
            <li key={author.name}>
              <a
                href={`https://github.com/${encodeURIComponent(githubUser)}`}
                target="_blank"
                rel="noreferrer noopener"
                title={t('contributors.profile', { name: githubUser })}
                className="flex items-center gap-2 border-2 border-line px-2 py-1.5 transition-colors hover:border-brand hover:text-brand"
              >
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt=""
                    loading="lazy"
                    width={24}
                    height={24}
                    className="size-6 shrink-0 border-2 border-line bg-elevated object-cover"
                  />
                ) : (
                  <span className="pixel grid size-6 shrink-0 place-items-center border-2 border-line bg-elevated text-[7px] text-ink uppercase">
                    {author.name.slice(0, 1)}
                  </span>
                )}
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="mono truncate text-[11px] text-ink">{author.name}</span>
                  {author.realName && author.realName !== author.name && (
                    <span className="mono truncate text-[10px] text-muted">{author.realName}</span>
                  )}
                </span>
                <span className="mono shrink-0 text-[10px] text-muted">[{author.count}]</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
