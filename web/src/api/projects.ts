import type { Project, ProjectsResponse } from '../types';

/**
 * 数据来源是打包进静态资源的 JSON（由 repos-parser 从 repos/*.md 生成）：
 * - `data/projects.json`        列表 + 标签 / 作者 / 分类聚合
 * - `data/projects/<id>.json`   单个项目详情，含渲染好的 readmeHtml
 */
const DATA_BASE = `${import.meta.env.BASE_URL}data`;

let listCache: ProjectsResponse | null = null;
const detailCache = new Map<string, Project>();

/** 只带上状态码与 URL，成句交给组件层按当前语言处理，数据层不依赖 i18n */
export class DataLoadError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`data ${status} ${url}`);
    this.name = 'DataLoadError';
    this.status = status;
    this.url = url;
  }
}

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new DataLoadError(res.status, url);
  }
  return (await res.json()) as T;
}

/** 项目列表 + 聚合信息（标签 / 作者 / 分类）；解析器已剔除正文，这里直接返回 */
export async function fetchProjects(): Promise<ProjectsResponse> {
  listCache ??= await loadJson<ProjectsResponse>(`${DATA_BASE}/projects.json`);
  return listCache;
}

/** 项目详情（包含 readmeHtml） */
export async function fetchProjectById(id: string): Promise<Project> {
  const cached = detailCache.get(id);
  if (cached) return cached;

  const project = await loadJson<Project>(`${DATA_BASE}/projects/${encodeURIComponent(id)}.json`);
  detailCache.set(id, project);
  return project;
}
