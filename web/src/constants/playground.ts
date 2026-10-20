import type { Project } from '../types';

/**
 * 彩蛋分类：打上这个 category 的仓库在首页与分类页签里隐藏，
 * 只在 /playground（连点黑猫 3 次解锁）里展示。
 *
 * ponytail: category 是自由字符串（repos-parser/src/lib/frontmatter.js），
 * 这里改常量即可换标签，无需动校验 schema。
 */
export const PLAYGROUND_CATEGORY = 'NAILONG';

/** 首页连点黑猫多少次解锁彩蛋入口 */
export const UNLOCK_CLICKS = 3;

export function isPlaygroundCategory(name: string): boolean {
  return name === PLAYGROUND_CATEGORY;
}

export function isPlaygroundProject(project: Pick<Project, 'category'>): boolean {
  return isPlaygroundCategory(project.category);
}

/**
 * 只用于「展示层」过滤。数据源 projects.json 里仍保留这些条目，
 * 所以 total / authors / categories 计数不受影响（需求：隐藏但计入总数）。
 */
export function filterOutPlayground<T extends Pick<Project, 'category'>>(
  projects: T[],
): T[] {
  return projects.filter((project) => !isPlaygroundProject(project));
}
