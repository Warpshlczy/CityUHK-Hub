import { memo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import type { Project } from '../types';
import { localizeProject, useI18n } from '../i18n';
import { avatarUrl } from '../utils/avatar';
import { formatNumber, formatRelativeTime } from '../utils/formatNumber';
import { GitHubIcon } from './GitHubIcon';
import { TagChips } from './TagChips';

interface NailongCardProps {
  project: Project;
  index: number;
}

/**
 * 彩蛋页专属卡片：比首页 card-brutal 更「歪」一点 ——
 * 倾斜角度、彩虹描边、悬停抖动全部来自 index.css 的 .nailong-card。
 */
export const NailongCard = memo(function NailongCard({ project, index }: NailongCardProps) {
  const { lang, t } = useI18n();
  const text = localizeProject(project, lang);
  const detailUrl = `/project/${project.id}`;
  const avatar = avatarUrl(project.authorAvatar, project.repo);
  // 左右交替歪一点，纯手抖感；写进 CSS 变量由样式消费
  const tilt = `${(index % 2 === 0 ? -1 : 1) * 1.4}deg`;

  return (
    <article
      style={{ '--tilt': tilt, animationDelay: `${Math.min(index * 70, 560)}ms` } as CSSProperties}
      className="nailong-card"
    >
      <div className="nailong-eyed" aria-hidden>
        {avatar ? (
          <img
            src={avatar}
            alt={t('sidebar.avatarAlt', { name: project.author })}
            loading="lazy"
            width={28}
            height={28}
          />
        ) : (
          <span className="pixel text-[9px] uppercase">{project.author.slice(0, 1)}</span>
        )}
      </div>

      <div className="nailong-top">
        <span className="pixel text-[9px]">{project.author}</span>
        <span className="pixel text-[8px] opacity-70">[{String(index + 1).padStart(2, '0')}]</span>
      </div>

      <h3 className="nailong-title">
        <Link to={detailUrl}>{text.name}</Link>
      </h3>

      {(text.about || text.description) && (
        <p className="nailong-desc">{text.about || text.description}</p>
      )}

      <div className="nailong-tags">
        <TagChips items={project.tags} max={4} size="sm" />
      </div>

      <div className="nailong-meta mono">
        <span className="flex items-center gap-1">
          <Star className="size-3.5" />
          {formatNumber(project.stars)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatRelativeTime(project.updatedAt, t)}
        </span>
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={t('card.starAria', { name: text.name })}
          className="nailong-star"
        >
          <GitHubIcon className="size-3.5" />
          <span className="pixel text-[8px]">STAR</span>
        </a>
      </div>
    </article>
  );
});
