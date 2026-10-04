// 查询语法：author:/tag:/lang:/category: 四种前缀，空格分隔且同时生效，同一前缀可写多次；
// 不带冒号的词走全文模糊匹配，其它带冒号的写法（如 http://）按自由文本处理。
export const QUALIFIER_KEYS = ['author', 'tag', 'lang', 'category'] as const;

export type QualifierKey = (typeof QUALIFIER_KEYS)[number];

export type Qualifiers = Record<QualifierKey, string[]>;

export interface QualifierChip {
  key: QualifierKey;
  value: string;
}

export interface ParsedQuery {
  qualifiers: Qualifiers;
  terms: string[];
  freeText: string;
}

// 值允许为空，用户还在输入 tag: 时不至于把结果清空；
// 值里含空格时用引号包起来，例如 category:"Learning assistance"
const TOKEN_PATTERN = /(\w+):("[^"]*"|\S*)/g;

function isQualifierKey(key: string): key is QualifierKey {
  return (QUALIFIER_KEYS as readonly string[]).includes(key);
}

function decodeValue(value: string): string {
  // 去掉用于包裹多词值的引号，再尝试 percent-decode
  const raw = value.replace(/^"|"$/g, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function emptyQualifiers(): Qualifiers {
  return { author: [], tag: [], lang: [], category: [] };
}

// 值的原始大小写保留，比较时统一转小写；完全相同的 key:value 只保留一次
export function parseQuery(input: string): ParsedQuery {
  const qualifiers = emptyQualifiers();

  const rest = input.replace(TOKEN_PATTERN, (raw, rawKey: string, rawValue: string) => {
    const key = rawKey.toLowerCase();
    if (!isQualifierKey(key)) return raw;
    const value = decodeValue(rawValue).trim();
    if (value && !qualifiers[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
      qualifiers[key].push(value);
    }
    return ' ';
  });

  const freeText = rest.replace(/\s+/g, ' ').trim();

  return {
    qualifiers,
    terms: freeText.toLowerCase().split(/\s+/).filter(Boolean),
    freeText,
  };
}

export function hasQualifiers(qualifiers: Qualifiers): boolean {
  return QUALIFIER_KEYS.some((key) => qualifiers[key].length > 0);
}

export function removeQualifier(input: string, key: QualifierKey, value?: string): string {
  const next = input.replace(TOKEN_PATTERN, (raw, rawKey: string, rawValue: string) => {
    if (rawKey.toLowerCase() !== key) return raw;
    if (value !== undefined && decodeValue(rawValue).toLowerCase() !== value.toLowerCase()) return raw;
    return ' ';
  });
  return next.replace(/\s+/g, ' ').trim();
}

export function toQualifierChips(input: string): QualifierChip[] {
  const { qualifiers } = parseQuery(input);
  return QUALIFIER_KEYS.flatMap((key) => qualifiers[key].map((value) => ({ key, value })));
}
