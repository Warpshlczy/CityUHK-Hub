import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, GitFork, Lock, RefreshCw, Send } from 'lucide-react';
import { checkUserFork, type ForkCheckStatus } from '../api/github';
import { Header } from '../components/Header';
import { REPO_NAME, REPO_OWNER, REPO_URL } from '../constants/repo';
import { useI18n, type TFunction } from '../i18n';
import { setRouteMeta } from '../utils/seo';
import {
  SUBMIT_BRANCH,
  buildForkNewFileUrl,
  buildProjectMarkdown,
  isUrlTooLong,
  parseDraftTags,
  toRepoFileName,
  type ProjectDraft,
} from '../utils/submitTemplate';

const EMPTY_DRAFT: ProjectDraft = {
  title: '',
  author: '',
  authorName: '',
  major: '',
  enrollmentYear: '',
  repoUrl: '',
  homepageUrl: '',
  category: '',
  tags: '',
  summary: '',
  intro: '',
  features: '',
};

// fork 引导的两张本地截图：fork1 展示 Fork 按钮，fork2 展示切到 feature 分支
const FORK_IMAGE_1 = `${import.meta.env.BASE_URL}fork1.png`;
const FORK_IMAGE_2 = `${import.meta.env.BASE_URL}fork2.png`;

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  disabled?: boolean;
}

function Field({ label, value, onChange, placeholder, required, hint, type, disabled }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="pixel text-[9px] text-muted">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <input
        type={type ?? 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-brutal px-2.5 py-2 text-[12px] disabled:bg-muted/20 disabled:text-smoke disabled:opacity-60"
      />
      {hint && <span className="mono text-[10px] text-muted">{hint}</span>}
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="pixel text-[9px] text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-brutal resize-y px-2.5 py-2 text-[12px]"
      />
    </label>
  );
}

/** 校验失败的错误统一显示在表单顶部；文案按当前语言取，调用方传入 t */
function validateDraft(draft: ProjectDraft, t: TFunction) {
  const errors: string[] = [];
  const required: Array<[keyof ProjectDraft, string]> = [
    ['title', 'form.field.title'],
    ['author', 'form.field.author'],
    ['authorName', 'form.field.authorName'],
    ['major', 'form.field.major'],
    ['enrollmentYear', 'form.field.year'],
    ['repoUrl', 'form.field.repoUrl'],
  ];
  for (const [key, labelKey] of required) {
    if (!draft[key].trim()) errors.push(t('validate.required', { label: t(labelKey) }));
  }

  const year = Number(draft.enrollmentYear);
  if (draft.enrollmentYear.trim() && (!Number.isInteger(year) || year < 2000 || year > 2100)) {
    errors.push(t('validate.year'));
  }

  const repoUrl = draft.repoUrl.trim();
  if (repoUrl && !/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+/.test(repoUrl)) {
    errors.push(t('validate.repoUrl'));
  }

  const tags = parseDraftTags(draft.tags);
  if (tags.length > 12) errors.push(t('validate.tagsMax'));
  if (tags.some((tag) => tag.length > 16)) errors.push(t('validate.tagLength'));

  if (draft.title.trim().length > 200) errors.push(t('validate.titleMax'));
  if (draft.authorName.trim().length > 120) errors.push(t('validate.authorNameMax'));
  if (draft.major.trim().length > 120) errors.push(t('validate.majorMax'));
  if (draft.summary.trim().length > 600) errors.push(t('validate.summaryMax'));
  if (draft.category.trim().length > 80) errors.push(t('validate.categoryMax'));

  return errors;
}

/** 文件名取仓库名，仓库名不合法时退回项目名 */
function draftFileName(draft: ProjectDraft) {
  const repo = draft.repoUrl
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '')
    .split('/')
    .pop();
  return `${toRepoFileName(repo || draft.title)}.md`;
}

interface StepProps {
  username: string;
  onUsernameChange: (value: string) => void;
  onConfirm: (username: string) => void;
}

/** 步骤一：填写 GitHub 用户名并确认已 fork，通过后才允许进入表单 */
function ForkGate({ username, onUsernameChange, onConfirm }: StepProps) {
  const { t } = useI18n();
  const [forkState, setForkState] = useState<ForkCheckStatus | 'idle' | 'checking'>('idle');
  // 只存词条 key，渲染期再取文案，切换语言时提示也跟着变
  const [hintKey, setHintKey] = useState('');

  const check = async () => {
    const user = username.trim();
    if (!user) {
      setHintKey('fork.hint.empty');
      return;
    }
    if (!/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/.test(user)) {
      setHintKey('fork.hint.invalid');
      return;
    }
    setHintKey('');
    setForkState('checking');
    const status = await checkUserFork(user);
    setForkState(status);
    if (status === 'has-fork') onConfirm(user);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="border-[3px] border-line bg-surface p-4">
          <div className="flex items-start gap-2">
            <GitFork className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="flex flex-col gap-1.5">
              <h3 className="pixel text-[10px] text-ink">{t('fork.title')}</h3>
              <p className="mono text-[11px] text-muted">
                {t('fork.desc.a')}
                <span className="text-brand">feature</span>
                {t('fork.desc.b')}
              </p>
            </div>
          </div>

          <ol className="mono mt-3 space-y-2 text-[11px] text-ink">
            <li className="flex gap-2">
              <span className="size-4 shrink-0 border-2 border-ink text-center text-[9px] leading-4">1</span>
              <span>
                {t('fork.step1')}
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  {REPO_URL}
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="size-4 shrink-0 border-2 border-ink text-center text-[9px] leading-4">2</span>
              <span>
                {t('fork.step2.a')}
                <span className="text-brand">feature</span>
                {t('fork.step2.b')}
                <code className="border border-ink bg-surface px-1">git fetch upstream feature</code>
                {t('fork.step2.c')}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="size-4 shrink-0 border-2 border-ink text-center text-[9px] leading-4">3</span>
              <span>{t('fork.step3')}</span>
            </li>
          </ol>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <figure className="border-2 border-line bg-surface p-2">
              <img
                src={FORK_IMAGE_1}
                alt={t('fork.img1Alt')}
                loading="lazy"
                className="w-full border border-line object-cover"
              />
              <figcaption className="mono mt-2 text-center text-[10px] text-muted">
                {t('fork.img1Caption')}
              </figcaption>
            </figure>
            <figure className="border-2 border-line bg-surface p-2">
              <img
                src={FORK_IMAGE_2}
                alt={t('fork.img2Alt')}
                loading="lazy"
                className="w-full border border-line object-cover"
              />
              <figcaption className="mono mt-2 text-center text-[10px] text-muted">
                {t('fork.img2Caption')}
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-[3px] border-line bg-surface p-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="pixel text-[9px] text-muted">
              {t('fork.username')}
              <span className="ml-1 text-brand">*</span>
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder="your-github-name"
              disabled={forkState === 'checking'}
              autoComplete="username"
              className="input-brutal px-2.5 py-2 text-[12px]"
            />
          </label>
          <button
            type="button"
            onClick={check}
            disabled={forkState === 'checking'}
            className="btn-brutal btn-brutal-rainbow h-11 shrink-0"
          >
            {forkState === 'checking' ? (
              <>
                <RefreshCw className="size-4 animate-spin" /> {t('fork.checking')}
              </>
            ) : (
              <>
                <Check className="size-4" /> {t('fork.confirm')}
              </>
            )}
          </button>
        </div>

        {hintKey && (
          <p className="mono border-l-[3px] border-brand bg-surface px-3 py-2 text-[11px] text-brand">
            {t(hintKey)}
          </p>
        )}

        {forkState === 'no-fork' && (
          <div className="border-[3px] border-accent bg-surface p-4">
            <p className="mono text-[11px] text-ink">
              {t('fork.noFork', { user: username.trim() })}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={check} className="btn-brutal btn-brutal-primary">
                {t('fork.recheck')}
              </button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal btn-brutal-secondary"
              >
                {t('fork.forkRepo')}
              </a>
            </div>
          </div>
        )}

        {forkState === 'error' && (
          <div className="border-[3px] border-accent bg-surface p-4">
            <p className="mono text-[11px] text-ink">{t('fork.error')}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={check} className="btn-brutal btn-brutal-primary">
                {t('fork.retry')}
              </button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal btn-brutal-secondary"
              >
                {t('fork.forkRepo')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 步骤二：完整表单。用户名已在上一步验证并锁定，提交直接生成 fork 分支上的新建文件链接 */
function SubmitForm({ confirmedUser, onRestart }: { confirmedUser: string; onRestart: () => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<ProjectDraft>({ ...EMPTY_DRAFT, author: confirmedUser });
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<{ url: string; fileName: string; compareUrl: string } | null>(null);

  const patch = (key: keyof ProjectDraft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const generate = () => {
    const found = validateDraft(draft, t);
    setErrors(found);
    if (found.length > 0) return;

    const fileName = `repos/${draftFileName(draft)}`;
    const content = buildProjectMarkdown(draft);
    const url = buildForkNewFileUrl(confirmedUser, fileName, content);
    if (isUrlTooLong(url)) {
      setErrors([t('form.tooLong')]);
      return;
    }
    // 提交后回到本站与 fork 的 feature 分支之间 compare，即可开 PR
    const compareUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/compare/${SUBMIT_BRANCH}...${encodeURIComponent(confirmedUser)}:${SUBMIT_BRANCH}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setDone({ url, fileName, compareUrl });
  };

  if (done) {
    return (
      <div className="space-y-4">
        <p className="mono border-l-[3px] border-brand bg-surface px-3 py-2 text-[12px] text-ink">
          {t('form.done.lead.a')}
          <span className="text-brand">feature</span>
          {t('form.done.lead.b')}
        </p>

        <div className="border-[3px] border-line bg-surface p-4">
          <h3 className="pixel text-[10px] text-ink">{t('form.step1.title')}</h3>
          <p className="mono mt-1.5 text-[11px] text-muted">
            {t('form.step1.a')}
            <code className="border border-ink bg-surface px-1">{done.fileName}</code>
            {t('form.step1.b')}
            <span className="text-ink"> Commit changes</span>
            {t('form.step1.c')}
            <span className="text-brand"> {SUBMIT_BRANCH}</span>
            {t('form.step1.d')}
          </p>
          <a
            href={done.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brutal btn-brutal-rainbow mt-3"
          >
            <ExternalLink className="size-4" /> {t('form.openFile')}
          </a>
        </div>

        <div className="border-[3px] border-line bg-surface p-4">
          <h3 className="pixel text-[10px] text-ink">{t('form.step2.title')}</h3>
          <p className="mono mt-1.5 text-[11px] text-muted">
            {t('form.step2.a')} CityUHK-Hub:feature{t('form.step2.b')}
            <span className="text-ink"> Compare &amp; pull request</span>
            {t('form.step2.c')}
            <span className="text-brand">feature</span>
            {t('form.step2.d')}
            <span className="text-accent"> {SUBMIT_BRANCH}</span>
            {t('form.step2.e')}
          </p>
          <a
            href={done.compareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brutal btn-brutal-primary mt-3"
          >
            <GitFork className="size-4" /> {t('form.openCompare')}
          </a>
        </div>

        <div className="border-[3px] border-line bg-surface p-4">
          <h3 className="pixel text-[10px] text-ink">{t('form.step3.title')}</h3>
          <p className="mono mt-1.5 text-[11px] text-muted">
            {t('form.step3.desc.a')}
            <span className="text-ink"> Create pull request</span>
            {t('form.step3.desc.b')}
            <span className="text-brand">feature</span>
            {t('form.step3.desc.c')}
          </p>
          <button type="button" onClick={() => window.open(done.compareUrl, '_blank', 'noopener,noreferrer')} className="btn-brutal btn-brutal-secondary mt-3">
            {t('form.doneInCompare')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setDraft({ ...EMPTY_DRAFT, author: confirmedUser });
              setErrors([]);
            }}
            className="btn-brutal btn-brutal-primary"
          >
            {t('form.submitAnother')}
          </button>
          <button type="button" onClick={onRestart} className="btn-brutal btn-brutal-secondary">
            {t('form.restart')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-[3px] border-brand bg-surface px-3 py-2">
        <Lock className="size-4 shrink-0 text-brand" />
        <span className="mono text-[11px] text-muted">
          {t('form.locked', { user: confirmedUser })}
        </span>
        <button
          type="button"
          onClick={onRestart}
          className="mono ml-auto text-[10px] text-accent underline underline-offset-2"
        >
          {t('form.changeUser')}
        </button>
      </div>

      {errors.length > 0 && (
        <ul className="mt-4 space-y-1 border-[3px] border-brand bg-surface px-3 py-2">
          {errors.map((message) => (
            <li key={message} className="mono text-[11px] text-brand">
              {message}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('form.field.title')} required value={draft.title} onChange={patch('title')} placeholder={t('form.field.namePlaceholder')} />
        <Field label={t('form.field.author')} required value={draft.author} onChange={() => {}} disabled hint={t('form.lockHint', { user: confirmedUser })} />
        <Field label={t('form.field.authorName')} required value={draft.authorName} onChange={patch('authorName')} placeholder={t('form.field.authorNamePlaceholder')} />
        <Field label={t('form.field.major')} required value={draft.major} onChange={patch('major')} placeholder={t('form.field.majorPlaceholder')} />
        <Field
          label={t('form.field.year')}
          required
          type="number"
          value={draft.enrollmentYear}
          onChange={patch('enrollmentYear')}
          placeholder="2024"
        />
        <Field
          label={t('form.field.repoUrl')}
          required
          value={draft.repoUrl}
          onChange={patch('repoUrl')}
          placeholder="https://github.com/owner/repo"
        />
        <Field label={t('form.field.demo')} value={draft.homepageUrl} onChange={patch('homepageUrl')} placeholder={t('form.field.demoPlaceholder')} />
        <Field label={t('form.field.category')} value={draft.category} onChange={patch('category')} placeholder={t('form.field.categoryPlaceholder')} />
        <Field
          label={t('form.field.tags')}
          value={draft.tags}
          onChange={patch('tags')}
          placeholder="python, cli"
          hint={t('form.field.tagsHint')}
        />
        <Field
          label={t('form.field.summary')}
          value={draft.summary}
          onChange={patch('summary')}
          placeholder={t('form.field.summaryPlaceholder')}
          hint={t('form.field.summaryHint')}
        />
      </div>

      <div className="mt-3 space-y-3">
        <TextArea
          label={t('form.field.intro')}
          value={draft.intro}
          onChange={patch('intro')}
          placeholder={t('form.field.introPlaceholder')}
        />
        <TextArea
          label={t('form.field.features')}
          value={draft.features}
          onChange={patch('features')}
          rows={3}
          placeholder={t('form.field.featuresPlaceholder')}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} className="btn-brutal btn-brutal-primary">
          <Send className="size-4" /> {t('form.generate')}
        </button>
        <button type="button" onClick={onRestart} className="btn-brutal btn-brutal-secondary">
          {t('form.prev')}
        </button>
        <span className="mono text-[10px] text-muted">{t('form.requiredNote')}</span>
      </div>
    </div>
  );
}

/** 独立的提交页面：先引导 fork 并验证用户名，通过后再填表 */
export function SubmitPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [confirmedUser, setConfirmedUser] = useState<string | null>(null);

  useEffect(() => {
    setRouteMeta({
      title: t('submitPage.meta.title'),
      description: t('submitPage.meta.description'),
      path: window.location.pathname,
    });
  }, [t]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mono mb-4 inline-flex items-center gap-1.5 text-[11px] text-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> {t('submitPage.back')}
        </button>

        <div className="panel-brutal p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="size-3 shrink-0 bg-brand" />
            <h2 className="pixel text-[10px] text-ink">{t('submitPage.heading')}</h2>
          </div>

          {/* 步骤指示器 */}
          <ol className="mono mt-3 flex items-center gap-2 text-[10px] text-muted">
            <li className={confirmedUser ? 'text-ink' : 'text-brand'}>
              {confirmedUser ? '✓' : '1'} {t('submitPage.step.fork')}
            </li>
            <span className="h-[2px] w-6 bg-line" aria-hidden />
            <li className={confirmedUser ? 'text-brand' : 'text-smoke/50'}>
              {confirmedUser ? '2' : ''} {t('submitPage.step.form')}
            </li>
          </ol>

          <div className="mt-4">
            {confirmedUser ? (
              <SubmitForm confirmedUser={confirmedUser} onRestart={() => setConfirmedUser(null)} />
            ) : (
              <ForkGate
                username={username}
                onUsernameChange={setUsername}
                onConfirm={setConfirmedUser}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
