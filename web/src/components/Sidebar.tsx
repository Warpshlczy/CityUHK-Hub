import { useState } from 'react';
import { FolderTree, Tags, Trophy } from 'lucide-react';
import { categoryLabel, useI18n } from '../i18n';
import type { AuthorItem, CategoryLabels, CountItem } from '../types';
import { slugify } from '../utils/slugify';
import { TagChips } from './TagChips';

interface SidebarProps {
  categories: CountItem[];
  tags: CountItem[];
  authors: AuthorItem[];
  total: number;
  activeCategory: string;
  selectedTags: string[];
  activeAuthor?: string;
  onSelectCategory: (name: string) => void;
  onToggleTag: (name: string) => void;
  onSelectAuthor: (name: string) => void;
  /** 分类显示名按语言取用；不传时退回 canonical 原文 */
  categoryLabels?: CategoryLabels;
}

const CATEGORY_HEADING_ID = slugify('sidebar-categories');
const TAG_HEADING_ID = slugify('sidebar-tags');
const AUTHOR_HEADING_ID = slugify('sidebar-authors');

const HEADING_CLASS = 'pixel flex items-center gap-2 text-[9px] text-muted';

/** 桌面端左侧 240px 固定筛选面板，移动端由首页放入抽屉中复用 */
export function Sidebar({
  categories,
  tags,
  authors,
  total,
  activeCategory,
  selectedTags,
  activeAuthor,
  onSelectCategory,
  onToggleTag,
  onSelectAuthor,
  categoryLabels,
}: SidebarProps) {
  const { t, lang } = useI18n();
  /** 作者榜默认只露前 8 位，展开后在面板内滚动浏览全部 */
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const visibleAuthors = showAllAuthors ? authors : authors.slice(0, 8);

  /** TAGS 默认只露前 60 个，展开后浏览全部 */
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? tags : tags.slice(0, 60);

  return (
    <nav aria-label={t('sidebar.label')} className="space-y-5">
      <section aria-labelledby={CATEGORY_HEADING_ID} className="panel-brutal p-3">
        <h3 id={CATEGORY_HEADING_ID} className={HEADING_CLASS}>
          <span className="size-3 shrink-0 bg-brand" />
          <FolderTree className="size-3.5" />
          CATEGORIES
        </h3>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              aria-pressed={activeCategory === ''}
              className="row-brutal"
            >
              <span>{t('sidebar.all')}</span>
              <span className="text-[11px] tabular-nums opacity-70">[{total}]</span>
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.name}>
              <button
                type="button"
                onClick={() => onSelectCategory(category.name)}
                aria-pressed={activeCategory === category.name}
                className="row-brutal"
              >
                <span className="truncate">{categoryLabel(category.name, lang, categoryLabels)}</span>
                <span className="text-[11px] tabular-nums opacity-70">[{category.count}]</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={TAG_HEADING_ID} className="panel-brutal p-3">
        <h3 id={TAG_HEADING_ID} className={HEADING_CLASS}>
          <span className="size-3 shrink-0 bg-accent" />
          <Tags className="size-3.5" />
          TAGS
        </h3>
        <div className="mt-3">
          <TagChips
            items={visibleTags.map((tag) => tag.name)}
            selected={selectedTags}
            onToggle={onToggleTag}
            counts={tags}
            size="sm"
          />
        </div>
        {tags.length > 60 && (
          <button
            type="button"
            onClick={() => setShowAllTags((value) => !value)}
            aria-expanded={showAllTags}
            className="mono mt-2 w-full border-2 border-line px-2 py-1.5 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand"
          >
            {showAllTags ? t('sidebar.collapseTags') : t('sidebar.expandTags', { count: tags.length - 60 })}
          </button>
        )}
      </section>

      <section aria-labelledby={AUTHOR_HEADING_ID} className="panel-brutal p-3">
        <h3 id={AUTHOR_HEADING_ID} className={HEADING_CLASS}>
          <span className="size-3 shrink-0 bg-brand" />
          <Trophy className="size-3.5" />
          AUTHORS
        </h3>
        <ul
          className={`mt-3 space-y-1${showAllAuthors ? ' max-h-72 overflow-y-auto pr-1' : ''}`}
        >
          {visibleAuthors.map((author, index) => (
            <li key={author.name}>
              <button
                type="button"
                onClick={() => onSelectAuthor(author.name)}
                aria-pressed={activeAuthor === author.name}
                className="row-brutal"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="pixel w-4 shrink-0 text-[9px] text-brand tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={t('sidebar.avatarAlt', { name: author.name })}
                      loading="lazy"
                      width={20}
                      height={20}
                      className="size-5 shrink-0 border-2 border-line bg-elevated object-cover"
                    />
                  ) : (
                    <span className="pixel grid size-5 shrink-0 place-items-center border-2 border-line bg-elevated text-[7px] text-ink uppercase">
                      {author.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="flex min-w-0 items-baseline gap-1">
                    <span className="truncate">{author.name}</span>
                    {author.realName && author.realName !== author.name && (
                      <span className="shrink-0 text-[11px] opacity-70">
                        （{author.realName}）
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-[11px] tabular-nums opacity-70">[{author.count}]</span>
              </button>
            </li>
          ))}
        </ul>
        {authors.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllAuthors((value) => !value)}
            aria-expanded={showAllAuthors}
            className="mono mt-2 w-full border-2 border-line px-2 py-1.5 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand"
          >
            {showAllAuthors ? t('sidebar.collapseAuthors') : t('sidebar.expandAuthors', { count: authors.length })}
          </button>
        )}
      </section>
    </nav>
  );
}
