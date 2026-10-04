import { SearchX } from 'lucide-react';
import { useI18n } from '../i18n';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const { t } = useI18n();
  const heading = title ?? t('empty.title');
  const text = description ?? t('empty.description');
  const action = actionLabel ?? t('empty.action');

  return (
    <div className="animate-fade-in-up panel-brutal flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="animate-border-flicker grid size-16 place-items-center border-[3px] text-brand">
        <SearchX className="size-7" />
      </span>
      <h3 className="text-base font-black text-ink">{heading}</h3>
      <p className="mono max-w-sm text-[13px] text-muted">{text}</p>
      {onAction && (
        <button type="button" onClick={onAction} className="btn-brutal btn-brutal-primary">
          {action}
        </button>
      )}
    </div>
  );
}
