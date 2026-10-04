import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import type { ProjectStats } from '../api/stats';
import { trackProjectEvent } from '../api/stats';
import type { Project } from '../types';
import { useI18n, localizeProject } from '../i18n';
import { avatarUrl } from '../utils/avatar';
import { formatNumber, formatRelativeTime } from '../utils/formatNumber';
import { computeHeat } from '../utils/heat';
import { languageColor } from '../utils/language';
import { GitHubIcon } from './GitHubIcon';
import { HeatFlames } from './HeatFlames';
import { TagChips } from './TagChips';

interface ProjectCardProps {
  project: Project;
  /** 用于入场动画延迟与像素编号 [01] */
  index: number;
  /** 该项目的站内统计；拿不到时热力值只用构建期数据算 */
  stats?: ProjectStats;
}

/** 卡片内容：作者 → 项目名 → 简介（仓库 About + 项目介绍，不含 Features）→ 标签 → 语言/star/更新时间 */
export const ProjectCard = memo(function ProjectCard({
  project,
  index,
  stats,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const text = localizeProject(project, lang);
  const detailUrl = `/project/${project.id}`;
  const delay = Math.min(index * 40, 400);
  const avatar = avatarUrl(project.authorAvatar, project.repo);
  const heat = computeHeat({ ...project, stats });

  return (
    <article
      onClick={() => navigate(detailUrl)}
      style={{ animationDelay: `${delay}ms` }}
      className="card-brutal cursor-target animate-fade-in-up group flex flex-col p-5"
    >
      <div className="flex items-center gap-2">
        {avatar ? (
          <img
            src={avatar}
            alt={t('sidebar.avatarAlt', { name: project.author })}
            loading="lazy"
            width={24}
            height={24}
            className="size-6 border-2 border-line bg-elevated object-cover"
          />
        ) : (
          // 拿不到头像时用 GitHub 用户名首字母占位
          <span className="pixel grid size-6 shrink-0 place-items-center border-2 border-line bg-elevated text-[7px] text-ink uppercase">
            {project.author.slice(0, 1)}
          </span>
        )}
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="mono truncate text-[11px] text-ink">{project.author}</span>
          {(() => {
            // 第二行：真名（与用户名不同才展示）+ 专业 + 入学年份
            const realName =
              project.authorName && project.authorName !== project.author
                ? project.authorName
                : '';
            const meta = [
              realName,
              project.major,
              project.enrollmentYear ? t('card.yearLevel', { year: project.enrollmentYear }) : '',
            ].filter(Boolean);
            if (meta.length === 0) return null;
            return (
              <span className="mono truncate text-[10px] text-muted">{meta.join(' · ')}</span>
            );
          })()}
        </span>
        {project.demoUrl && (
          <span className="pixel seal-demo shrink-0 px-1.5 py-1 text-[7px]">DEMO</span>
        )}
        {project.hasRelease && (
          <span className="pixel seal-release shrink-0 px-1.5 py-1 text-[7px]">RELEASE</span>
        )}
        <HeatFlames level={heat.level} className="ml-auto shrink-0 text-[10px]" />
        <span className="pixel shrink-0 text-[10px] text-muted">
          [{String(index + 1).padStart(2, '0')}]
        </span>
      </div>

      <h3 className="mt-3 text-lg font-black tracking-tight text-ink transition-colors group-hover:text-brand">
        <Link to={detailUrl} onClick={(event) => event.stopPropagation()} className="focus-visible:outline-none">
          {text.name}
        </Link>
      </h3>

      {/* 简介：仓库 About（最多两行）+ 项目介绍摘要（最多三行）；两者都没有时整块留空 */}
      <div className="mt-2 min-h-[6.75rem] space-y-1.5">
        {text.about && (
          <p className="line-clamp-2 text-[13px] leading-5 text-ink">{text.about}</p>
        )}
        {text.description && (
          <p className="line-clamp-3 text-[12px] leading-5 text-muted">{text.description}</p>
        )}
      </div>

      <div className="mb-4 mt-3">
        <TagChips items={project.tags} max={3} size="sm" />
      </div>

      <div className="mono mt-auto flex items-center gap-3 border-t-[3px] border-line pt-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 border border-line"
            style={{ backgroundColor: languageColor(project.language) }}
          />
          {project.language || '—'}
        </span>
        <span className="flex items-center gap-1 text-brand">
          <Star className="size-3.5" />
          <span className="tabular-nums">{formatNumber(project.stars)}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatRelativeTime(project.updatedAt, t)}
        </span>
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(event) => {
            event.stopPropagation();
            trackProjectEvent('click', project.id);
          }}
          aria-label={t('card.starAria', { name: text.name })}
          title={t('card.starTitle')}
          className="ml-auto flex items-center gap-1.5 border-2 border-line px-2 py-1 transition-colors hover:border-brand hover:text-brand"
        >
          <GitHubIcon className="size-3.5" />
          <span className="pixel text-[8px]">STAR</span>
        </a>
      </div>
    </article>
  );
});
