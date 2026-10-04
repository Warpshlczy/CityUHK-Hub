import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { useI18n } from '../i18n';
import { setRouteMeta } from '../utils/seo';

/** 未匹配的路径：给出明确说明，而不是静默跳回首页 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    setRouteMeta({
      title: t('notfound.meta.title'),
      description: t('notfound.meta.description'),
      path: window.location.pathname,
      noindex: true,
    });
  }, [t]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <EmptyState
          title={t('notfound.title')}
          description={t('notfound.description')}
          actionLabel={t('notfound.action')}
          onAction={() => navigate('/')}
        />
      </main>
    </div>
  );
}
