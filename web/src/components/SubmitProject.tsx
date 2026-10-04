import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useI18n } from '../i18n';

/** 顶栏提交按钮；窄屏只留图标，避免挤占搜索栏 */
export function SubmitProject() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => navigate('/submit')}
      aria-label={t('submit.button')}
      title={t('submit.tooltip')}
      className="chip-brutal flex h-11 shrink-0 items-center gap-2 px-3 text-[9px]"
    >
      <Plus className="size-4 text-brand" />
      {/* 像素字标沿用拉丁大写，与其它 pixel 标题一致，不进词条 */}
      <span className="pixel hidden sm:inline">SUBMIT</span>
    </button>
  );
}