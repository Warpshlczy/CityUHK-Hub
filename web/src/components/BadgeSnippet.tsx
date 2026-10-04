import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useI18n } from '../i18n';
import { SITE_ORIGIN } from '../utils/seo';

/** 给作者贴到仓库 README 的徽章片段，兼作指向项目页的外链。 */
export function BadgeSnippet({ id }: { id: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const snippet = `[![CityUHK Hub](${SITE_ORIGIN}/badge/${id}.svg)](${SITE_ORIGIN}/project/${id})`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 非 https 或未授权时剪贴板不可用，不报错，用户仍可手动选中复制
    }
  };

  return (
    <section className="panel-brutal mt-6 p-6">
      <h2 className="pixel flex items-center gap-3 text-[10px] text-muted">
        <span className="size-3 bg-accent" />
        {t('badge.heading')}
      </h2>
      <p className="mono mt-3 text-[12px] leading-6 text-muted">{t('badge.description')}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* 用相对路径加载，本地预览也能看到；复制出去的片段用绝对地址 */}
        <img src={`/badge/${id}.svg`} alt={t('badge.alt')} height={20} className="h-5 w-auto" />
        <code className="mono min-w-0 flex-1 overflow-x-auto border-2 border-line px-2 py-1.5 text-[11px] whitespace-nowrap">
          {snippet}
        </code>
        <button type="button" onClick={copy} className="btn-brutal btn-brutal-secondary">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t('badge.copied') : t('badge.copy')}
        </button>
      </div>
    </section>
  );
}
