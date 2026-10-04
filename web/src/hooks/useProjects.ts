import { useCallback, useEffect, useState } from 'react';
import { enrichProjectsWithGithub } from '../api/github';
import { DataLoadError, fetchProjectById, fetchProjects } from '../api/projects';
import { useI18n, type TFunction } from '../i18n';
import type { Project, ProjectsResponse } from '../types';

/** 错误只存结构化信息，成句放在渲染期，切换语言时文案跟着变 */
type LoadFailure = { status: number; url: string } | 'unknown' | 'missing-id' | null;

function toFailure(err: unknown): LoadFailure {
  return err instanceof DataLoadError ? { status: err.status, url: err.url } : 'unknown';
}

function failureMessage(failure: LoadFailure, t: TFunction): string | null {
  if (failure === null) return null;
  if (failure === 'unknown') return t('data.loadError');
  if (failure === 'missing-id') return t('data.missingId');
  return t('data.loadErrorWithStatus', { status: failure.status, url: failure.url });
}

interface ProjectsState {
  data: ProjectsResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** 首页：列表 + 聚合 */
export function useProjects(): ProjectsState {
  const { t } = useI18n();
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<LoadFailure>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    setLoading(true);
    setFailure(null);

    const run = async () => {
      try {
        const res = await fetchProjects();
        if (!alive) return;
        setData(res);
        setLoading(false);

        // 先出列表，缺的语言 / stars 再异步补
        const enriched = await enrichProjectsWithGithub(res.projects, controller.signal);
        if (alive && enriched) {
          setData((prev) => (prev ? { ...prev, projects: enriched } : prev));
        }
      } catch (err: unknown) {
        if (!alive) return;
        setFailure(toFailure(err));
        setLoading(false);
      }
    };
    run();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error: failureMessage(failure, t), reload };
}

interface ProjectState {
  project: Project | null;
  loading: boolean;
  error: string | null;
}

/** 详情页：单个项目（含 readmeHtml） */
export function useProject(id: string | undefined): ProjectState {
  const { t } = useI18n();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<LoadFailure>(null);

  useEffect(() => {
    if (!id) {
      setProject(null);
      setFailure('missing-id');
      setLoading(false);
      return;
    }

    let alive = true;
    const controller = new AbortController();
    setLoading(true);
    setFailure(null);

    const run = async () => {
      try {
        const res = await fetchProjectById(id);
        if (!alive) return;
        setProject(res);
        setLoading(false);

        const enriched = await enrichProjectsWithGithub([res], controller.signal);
        if (alive && enriched) setProject(enriched[0]);
      } catch (err: unknown) {
        if (!alive) return;
        setProject(null);
        setFailure(toFailure(err));
        setLoading(false);
      }
    };
    run();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  return { project, loading, error: failureMessage(failure, t) };
}
