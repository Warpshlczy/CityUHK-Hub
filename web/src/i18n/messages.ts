// 站内 UI 文案的三语词条。key 用点号分层，同一 key 必须在三种语言都有值。
// 项目条目（repos/*.md）的正文翻译由 repos-parser 构建期产出，不进这份词典。
// 说明：品牌名 CityUHK Hub 与 fork 分支名 feature 等专有名词不做翻译，直接写在 JSX 里。

export type Lang = 'en' | 'zh-CN' | 'zh-TW';

export const LANGS: readonly Lang[] = ['en', 'zh-CN', 'zh-TW'];

/** 首要语言是英语 */
export const DEFAULT_LANG: Lang = 'en';

export type MessageEntry = Record<Lang, string>;

export const MESSAGES: Record<string, MessageEntry> = {
  // ── 顶栏 / 通用 ────────────────────────────────────────────────
  'header.tagline': {
    en: 'CityU Open-Source Hub',
    'zh-CN': '城大开源自助导航',
    'zh-TW': '城大開源自助導航',
  },
  'header.logoAlt': {
    en: 'CityUHK Hub logo',
    'zh-CN': 'CityUHK Hub 标志',
    'zh-TW': 'CityUHK Hub 標誌',
  },
  'header.openFilters': {
    en: 'Open filters',
    'zh-CN': '打开筛选面板',
    'zh-TW': '開啟篩選面板',
  },
  'theme.toLight': {
    en: 'Switch to light mode',
    'zh-CN': '切换到亮色模式',
    'zh-TW': '切換到亮色模式',
  },
  'theme.toDark': {
    en: 'Switch to dark mode',
    'zh-CN': '切换到暗色模式',
    'zh-TW': '切換到暗色模式',
  },
  'lang.label': { en: 'Language', 'zh-CN': '语言', 'zh-TW': '語言' },
  'lang.switchTo': { en: 'Switch language', 'zh-CN': '切换语言', 'zh-TW': '切換語言' },
  'lang.en': { en: 'English', 'zh-CN': 'English', 'zh-TW': 'English' },
  'lang.zhCN': { en: '简体中文', 'zh-CN': '简体中文', 'zh-TW': '简体中文' },
  'lang.zhTW': { en: '繁體中文', 'zh-CN': '繁體中文', 'zh-TW': '繁體中文' },
  'submit.button': { en: 'Submit', 'zh-CN': '提交', 'zh-TW': '提交' },
  'submit.tooltip': {
    en: 'Submit your project (fork this site first)',
    'zh-CN': '我也要提交项目（先 fork 本站再填表）',
    'zh-TW': '我也要提交專案（先 fork 本站再填表）',
  },

  // ── 常用链接抽屉 ──────────────────────────────────────────────
  'links.button': {
    en: 'CityUHK Useful Links',
    'zh-CN': '城大常用站点',
    'zh-TW': '城大常用站點',
  },
  'links.heading': { en: 'USEFUL LINKS', 'zh-CN': 'USEFUL LINKS', 'zh-TW': 'USEFUL LINKS' },
  'links.subtitle': {
    en: 'CityUHK Useful Links',
    'zh-CN': 'CityUHK Useful Links',
    'zh-TW': 'CityUHK Useful Links',
  },
  'links.close': { en: 'Close links panel', 'zh-CN': '关闭链接面板', 'zh-TW': '關閉連結面板' },
  'links.aims.name': { en: 'CityUHK AIMS', 'zh-CN': 'CityUHK AIMS', 'zh-TW': 'CityUHK AIMS' },
  'links.aims.desc': {
    en: 'Course selection, grades & student records',
    'zh-CN': '选课、成绩与学籍系统',
    'zh-TW': '選課、成績與學籍系統',
  },
  'links.canvas.name': { en: 'CityUHK Canvas', 'zh-CN': 'CityUHK Canvas', 'zh-TW': 'CityUHK Canvas' },
  'links.canvas.desc': {
    en: 'Course materials, assignments & quizzes',
    'zh-CN': '课程资料、作业与测验',
    'zh-TW': '課程資料、作業與測驗',
  },
  'links.website.name': { en: 'CityUHK Website', 'zh-CN': 'CityUHK 官网', 'zh-TW': 'CityUHK 官網' },
  'links.website.desc': {
    en: 'City University of Hong Kong official site',
    'zh-CN': '香港城市大学官方网站',
    'zh-TW': '香港城市大學官方網站',
  },
  'links.portal.name': { en: 'CityUHK Portal', 'zh-CN': 'CityUHK Portal', 'zh-TW': 'CityUHK Portal' },
  'links.portal.desc': {
    en: 'Campus services & facilities portal',
    'zh-CN': '校内服务与设施入口',
    'zh-TW': '校內服務與設施入口',
  },

  // ── 空状态 ────────────────────────────────────────────────────
  'empty.title': {
    en: 'No matching projects',
    'zh-CN': '未找到匹配项目',
    'zh-TW': '未找到符合項目',
  },
  'empty.description': {
    en: 'Try removing some filters or changing your keywords.',
    'zh-CN': '试试减少筛选条件，或更换关键词。',
    'zh-TW': '試試減少篩選條件，或更換關鍵字。',
  },
  'empty.action': {
    en: 'Clear all filters',
    'zh-CN': '清除全部筛选',
    'zh-TW': '清除全部篩選',
  },

  // ── 搜索栏 ────────────────────────────────────────────────────
  'search.placeholder': {
    en: 'Search projects…',
    'zh-CN': '搜索项目…',
    'zh-TW': '搜尋專案…',
  },
  'search.label': { en: 'Search projects', 'zh-CN': '搜索项目', 'zh-TW': '搜尋專案' },
  'search.clear': { en: 'Clear search', 'zh-CN': '清空搜索', 'zh-TW': '清空搜尋' },
  'search.rules': { en: 'Search syntax', 'zh-CN': '搜索规则', 'zh-TW': '搜尋規則' },
  'search.rule.author': { en: 'by author', 'zh-CN': '按作者', 'zh-TW': '按作者' },
  'search.rule.tag': { en: 'by tag', 'zh-CN': '按标签', 'zh-TW': '按標籤' },
  'search.rule.lang': { en: 'by language', 'zh-CN': '按语言', 'zh-TW': '按語言' },
  'search.rule.category': { en: 'by category', 'zh-CN': '按分类', 'zh-TW': '按分類' },
  'search.tip.combine': {
    en: 'Space-separated conditions all apply at once: author:alice lang:Python',
    'zh-CN': '空格分隔多个条件，同时生效：author:alice lang:Python',
    'zh-TW': '空格分隔多個條件，同時生效：author:alice lang:Python',
  },
  'search.tip.stack': {
    en: 'Repeat a key to stack conditions: tag:NLP tag:transformer',
    'zh-CN': '同一个条件可叠加：tag:NLP tag:情感分析',
    'zh-TW': '同一個條件可疊加：tag:NLP tag:情感分析',
  },
  'search.tip.free': {
    en: 'Words without a colon are fuzzy full-text matches: author:alice emotion',
    'zh-CN': '不带冒号的词按全文模糊匹配：author:alice 情感',
    'zh-TW': '不帶冒號的詞按全文模糊匹配：author:alice 情感',
  },
  'search.removeQualifier': {
    en: 'Remove this condition',
    'zh-CN': '移除该条件',
    'zh-TW': '移除該條件',
  },
  'search.keyword': { en: 'Keyword ▸ {value}', 'zh-CN': '关键词 ▸ {value}', 'zh-TW': '關鍵字 ▸ {value}' },

  // ── 筛选面板 ──────────────────────────────────────────────────
  'sidebar.label': { en: 'Filter panel', 'zh-CN': '筛选面板', 'zh-TW': '篩選面板' },
  'sidebar.categories': { en: 'CATEGORIES', 'zh-CN': 'CATEGORIES', 'zh-TW': 'CATEGORIES' },
  'sidebar.tags': { en: 'TAGS', 'zh-CN': 'TAGS', 'zh-TW': 'TAGS' },
  'sidebar.authors': { en: 'AUTHORS', 'zh-CN': 'AUTHORS', 'zh-TW': 'AUTHORS' },
  'sidebar.all': { en: 'All', 'zh-CN': '全部', 'zh-TW': '全部' },
  'sidebar.avatarAlt': { en: "{name}'s avatar", 'zh-CN': '{name} 的头像', 'zh-TW': '{name} 的頭像' },
  'sidebar.expandAuthors': {
    en: 'Show all {count} authors ↓',
    'zh-CN': '展开全部 {count} 位作者 ↓',
    'zh-TW': '展開全部 {count} 位作者 ↓',
  },
  'sidebar.collapseAuthors': { en: 'Collapse authors ↑', 'zh-CN': '收起作者榜 ↑', 'zh-TW': '收起作者榜 ↑' },
  'sidebar.expandTags': {
    en: 'Show all {count} tags ↓',
    'zh-CN': '展开全部 {count} 个标签 ↓',
    'zh-TW': '展開全部 {count} 個標籤 ↓',
  },
  'sidebar.collapseTags': { en: 'Collapse tags ↑', 'zh-CN': '收起标签 ↑', 'zh-TW': '收起標籤 ↑' },

  // ── 贡献者墙 ──────────────────────────────────────────────────
  'contributors.title': {
    en: 'Contributors · {count}',
    'zh-CN': '贡献者 · {count}',
    'zh-TW': '貢獻者 · {count}',
  },
  'contributors.description': {
    en: "These students' repositories are already listed — click an avatar to visit their GitHub profile.",
    'zh-CN': '这些同学的仓库已被收录，点击头像去他们的 GitHub 主页看看。',
    'zh-TW': '這些同學的倉庫已被收錄，點擊頭像去他們的 GitHub 主頁看看。',
  },
  'contributors.profile': {
    en: "{name}'s GitHub profile",
    'zh-CN': '@{name} 的 GitHub 主页',
    'zh-TW': '@{name} 的 GitHub 主頁',
  },

  // ── 首页 ──────────────────────────────────────────────────────
  'home.meta.title': {
    en: 'CityUHK Hub · CityU Open-Source Hub',
    'zh-CN': 'CityUHK Hub · 城大开源自助导航',
    'zh-TW': 'CityUHK Hub · 城大開源自助導航',
  },
  'home.meta.description': {
    en: 'A navigation site for open-source projects by City University of Hong Kong (CityUHK) students: {total} projects listed, filter by author, major, tag, language and category, and jump straight to the GitHub repository.',
    'zh-CN': '香港城市大学（CityUHK）学生开源项目导航：已收录 {total} 个项目，支持按作者、专业、标签、语言与分类检索，一键直达 GitHub 仓库。',
    'zh-TW': '香港城市大學（CityUHK）學生開源專案導航：已收錄 {total} 個專案，支援按作者、專業、標籤、語言與分類檢索，一鍵直達 GitHub 倉庫。',
  },
  'home.sort.heat': { en: 'Hottest', 'zh-CN': '热度最高', 'zh-TW': '熱度最高' },
  'home.sort.updated': { en: 'Recently updated', 'zh-CN': '最近更新', 'zh-TW': '最近更新' },
  'home.sort.stars': { en: 'Most stars', 'zh-CN': 'Star 最多', 'zh-TW': 'Star 最多' },
  'home.sort.name': { en: 'Name', 'zh-CN': '名称排序', 'zh-TW': '名稱排序' },
  'home.sort.label': { en: 'SORT', 'zh-CN': 'SORT', 'zh-TW': 'SORT' },
  'home.marquee.slogan': {
    en: 'CITYUHK HUB // CityU Open-Source Hub',
    'zh-CN': 'CITYUHK HUB // 城大开源自助导航',
    'zh-TW': 'CITYUHK HUB // 城大開源自助導航',
  },
  'home.marquee.projects': { en: '{count} PROJECTS', 'zh-CN': '{count} 个项目', 'zh-TW': '{count} 個專案' },
  'home.marquee.contributors': {
    en: '{count} CONTRIBUTORS',
    'zh-CN': '{count} 位贡献者',
    'zh-TW': '{count} 位貢獻者',
  },
  'home.marquee.categories': {
    en: '{count} CATEGORIES',
    'zh-CN': '{count} 个分类',
    'zh-TW': '{count} 個分類',
  },
  'home.marquee.launch': {
    en: 'CityUHK Hub is officially live — welcome to submit your projects.',
    'zh-CN': 'CityUHK Hub 正式上线，欢迎提交项目',
    'zh-TW': 'CityUHK Hub 正式上線，歡迎提交專案',
  },
  'home.stat.projects': { en: 'PROJECTS', 'zh-CN': 'PROJECTS', 'zh-TW': 'PROJECTS' },
  'home.stat.categories': { en: 'CATEGORIES', 'zh-CN': 'CATEGORIES', 'zh-TW': 'CATEGORIES' },
  'home.stat.tags': { en: 'TAGS', 'zh-CN': 'TAGS', 'zh-TW': 'TAGS' },
  'home.stat.authors': { en: 'AUTHORS', 'zh-CN': 'AUTHORS', 'zh-TW': 'AUTHORS' },
  'home.stat.visits': { en: 'VISITS', 'zh-CN': 'VISITS', 'zh-TW': 'VISITS' },
  'home.categoryAll': { en: 'ALL', 'zh-CN': '全部', 'zh-TW': '全部' },
  'home.newThisWeek': {
    en: 'New this week · {count}',
    'zh-CN': '本周新增 · {count}',
    'zh-TW': '本週新增 · {count}',
  },
  'home.result.label': { en: 'RESULT', 'zh-CN': 'RESULT', 'zh-TW': 'RESULT' },
  'home.result.count': {
    en: '{count} projects',
    'zh-CN': '共 {count} 个项目',
    'zh-TW': '共 {count} 個專案',
  },
  'home.clearFilters': { en: 'Clear filters', 'zh-CN': '清除筛选', 'zh-TW': '清除篩選' },
  'home.reload': { en: 'Reload', 'zh-CN': '重新加载', 'zh-TW': '重新載入' },
  'home.empty.title': {
    en: 'No project data yet',
    'zh-CN': '还没有项目数据',
    'zh-TW': '還沒有專案資料',
  },
  'home.empty.description': {
    en: 'There are no displayable project documents under repos/. Add a Markdown file following the format in repos/_template.md, then rebuild.',
    'zh-CN': 'repos/ 目录下没有可展示的项目文档。请按 repos/_template.md 的格式新增一份 Markdown，再重新构建。',
    'zh-TW': 'repos/ 目錄下沒有可展示的專案文件。請按 repos/_template.md 的格式新增一份 Markdown，再重新建置。',
  },
  'home.repo.aria': {
    en: 'Site GitHub repository (stars welcome)',
    'zh-CN': '本站 GitHub 仓库（欢迎 Star）',
    'zh-TW': '本站 GitHub 倉庫（歡迎 Star）',
  },
  'home.repo.title': {
    en: 'Site GitHub repository — stars welcome',
    'zh-CN': '本站 GitHub 仓库，欢迎 Star 支持',
    'zh-TW': '本站 GitHub 倉庫，歡迎 Star 支持',
  },
  'home.generated': { en: 'GENERATED {time}', 'zh-CN': '生成于 {time}', 'zh-TW': '產生於 {time}' },
  'home.footer.tagline': {
    en: 'CityU Open-Source Project Navigator',
    'zh-CN': '香港城市大学开源项目导航',
    'zh-TW': '香港城市大學開源專案導航',
  },
  'home.filter': { en: 'FILTER', 'zh-CN': '筛选', 'zh-TW': '篩選' },
  'home.closeFilters': { en: 'Close filter panel', 'zh-CN': '关闭筛选面板', 'zh-TW': '關閉篩選面板' },

  // ── 项目卡片 ──────────────────────────────────────────────────
  'card.yearLevel': { en: 'Class of {year}', 'zh-CN': '{year} 级', 'zh-TW': '{year} 級' },
  'card.starAria': {
    en: 'Star {name} on GitHub',
    'zh-CN': '去 GitHub 为 {name} 点 Star',
    'zh-TW': '去 GitHub 為 {name} 點 Star',
  },
  'card.starTitle': {
    en: 'Star on GitHub to support the author',
    'zh-CN': '去 GitHub 点 Star 支持作者',
    'zh-TW': '去 GitHub 點 Star 支持作者',
  },

  // ── 项目详情 ──────────────────────────────────────────────────
  'detail.meta.title': {
    en: '{name} · CityUHK Hub',
    'zh-CN': '{name} · CityUHK Hub',
    'zh-TW': '{name} · CityUHK Hub',
  },
  'detail.meta.fallback': {
    en: '{name} — a CityU open-source project by {author}',
    'zh-CN': '{name} —— 城大开源项目，作者 {author}',
    'zh-TW': '{name} —— 城大開源專案，作者 {author}',
  },
  'detail.back': { en: 'BACK', 'zh-CN': '返回', 'zh-TW': '返回' },
  'detail.notFound.title': {
    en: 'Project not found',
    'zh-CN': '未找到该项目',
    'zh-TW': '未找到該專案',
  },
  'detail.notFound.description': {
    en: 'The project may have been removed, or the link is wrong.',
    'zh-CN': '项目可能已被移除，或链接有误。',
    'zh-TW': '專案可能已被移除，或連結有誤。',
  },
  'detail.notFound.action': { en: 'Back to home', 'zh-CN': '返回首页', 'zh-TW': '返回首頁' },
  'detail.viewRepo': { en: 'View repository', 'zh-CN': '查看仓库', 'zh-TW': '查看倉庫' },
  'detail.encourage': {
    en: 'If this project helps you, give it a ⭐ Star on the repository — it is the most direct encouragement for the author, and it helps more students find it.',
    'zh-CN': '如果这个项目对你有帮助，去仓库点一下 ⭐ Star —— 这是对作者最直接的鼓励，也能让更多同学搜到它。',
    'zh-TW': '如果這個專案對你有幫助，去倉庫點一下 ⭐ Star —— 這是對作者最直接的鼓勵，也能讓更多同學搜到它。',
  },
  'detail.sr.stars': { en: 'Stars', 'zh-CN': 'Stars', 'zh-TW': 'Stars' },
  'detail.sr.forks': { en: 'Forks', 'zh-CN': 'Forks', 'zh-TW': 'Forks' },
  'detail.sr.license': { en: 'License', 'zh-CN': 'License', 'zh-TW': 'License' },
  'detail.sr.language': { en: 'Language', 'zh-CN': '语言', 'zh-TW': '語言' },
  'detail.sr.created': { en: 'Created', 'zh-CN': '创建时间', 'zh-TW': '建立時間' },
  'detail.sr.updated': { en: 'Updated', 'zh-CN': '更新时间', 'zh-TW': '更新時間' },
  'detail.sr.views': { en: 'Site views', 'zh-CN': '站内浏览', 'zh-TW': '站內瀏覽' },
  'detail.createdAt': { en: 'Created {date}', 'zh-CN': '创建于 {date}', 'zh-TW': '建立於 {date}' },
  'detail.updatedAt': { en: 'Updated {time}', 'zh-CN': '更新于 {time}', 'zh-TW': '更新於 {time}' },
  'detail.views': { en: 'Viewed {count} times', 'zh-CN': '浏览 {count} 次', 'zh-TW': '瀏覽 {count} 次' },
  'detail.meta.name': { en: 'Name', 'zh-CN': '姓名', 'zh-TW': '姓名' },
  'detail.meta.major': { en: 'Major', 'zh-CN': '专业', 'zh-TW': '專業' },
  'detail.meta.year': { en: 'Enrollment year', 'zh-CN': '入学年份', 'zh-TW': '入學年份' },
  'detail.readmeEmpty': {
    en: 'This project has no README yet.',
    'zh-CN': '该项目暂无 README 内容。',
    'zh-TW': '該專案暫無 README 內容。',
  },

  // ── 热度面板 ──────────────────────────────────────────────────
  'heat.heading': { en: 'Project heat', 'zh-CN': '项目热度', 'zh-TW': '專案熱度' },
  'heat.stars': { en: 'Total stars', 'zh-CN': 'Star 总数', 'zh-TW': 'Star 總數' },
  'heat.growth': { en: 'Stars gained in 7 days', 'zh-CN': '近 7 天涨星', 'zh-TW': '近 7 天漲星' },
  'heat.views': { en: 'Site views', 'zh-CN': '站内浏览', 'zh-TW': '站內瀏覽' },
  'heat.clicks': { en: 'GitHub clicks', 'zh-CN': '跳转 GitHub', 'zh-TW': '跳轉 GitHub' },
  'heat.forks': { en: 'Forks', 'zh-CN': 'Fork 数', 'zh-TW': 'Fork 數' },
  'heat.freshness': { en: 'Last updated', 'zh-CN': '最近更新', 'zh-TW': '最近更新' },
  'heat.days': { en: '{count} days', 'zh-CN': '{count}天', 'zh-TW': '{count}天' },
  'heat.level.1': { en: 'Getting started', 'zh-CN': '起步中', 'zh-TW': '起步中' },
  'heat.level.2': { en: 'Gaining heat', 'zh-CN': '有点热度', 'zh-TW': '有點熱度' },
  'heat.level.3': { en: 'Hottest now', 'zh-CN': '当下最热', 'zh-TW': '當下最熱' },
  'heat.flamesTitle': { en: 'Heat: {label}', 'zh-CN': '热度 {label}', 'zh-TW': '熱度 {label}' },
  'heat.note': {
    en: 'Heat tops out at 100, weighted from the six dimensions on the left; the bars show each dimension\u2019s contribution to the score, and the numbers are raw counts. A "—" means no data yet (7-day star growth needs a week of history); site stats are anonymous counts.',
    'zh-CN': '热度满分 100，由左侧六项加权算出；进度条是各维对热度的贡献，右侧是真实数量。显示「—」表示该维暂无数据（涨星要站内攒够 7 天）；站内数据为匿名计数。',
    'zh-TW': '熱度滿分 100，由左側六項加權算出；進度條是各維對熱度的貢獻，右側是真實數量。顯示「—」表示該維暫無資料（漲星要站內攢夠 7 天）；站內資料為匿名計數。',
  },

  // ── 相关项目 ──────────────────────────────────────────────────
  'related.heading': { en: 'Keep exploring', 'zh-CN': '继续逛逛', 'zh-TW': '繼續逛逛' },
  'related.byAuthor': {
    en: 'More from {name}',
    'zh-CN': '{name} 的其他项目',
    'zh-TW': '{name} 的其他專案',
  },
  'related.byTags': { en: 'Related projects', 'zh-CN': '相关项目', 'zh-TW': '相關專案' },

  // ── 徽章片段 ──────────────────────────────────────────────────
  'badge.heading': { en: 'For authors: add a badge', 'zh-CN': '项目作者：贴个徽章', 'zh-TW': '專案作者：貼個徽章' },
  'badge.description': {
    en: 'Paste the snippet below into your repository README to show that this project is listed on CityUHK Hub, and to give it a backlink.',
    'zh-CN': '把下面这段放进你的仓库 README，既标注这个项目已被 CityUHK Hub 收录，也能给它带来一条外链。',
    'zh-TW': '把下面這段放進你的倉庫 README，既標註這個專案已被 CityUHK Hub 收錄，也能給它帶來一條外鏈。',
  },
  'badge.alt': {
    en: 'CityUHK Hub listing badge',
    'zh-CN': 'CityUHK Hub 收录徽章',
    'zh-TW': 'CityUHK Hub 收錄徽章',
  },
  'badge.copy': { en: 'Copy', 'zh-CN': '复制', 'zh-TW': '複製' },
  'badge.copied': { en: 'Copied', 'zh-CN': '已复制', 'zh-TW': '已複製' },

  // ── 欢迎弹窗 ──────────────────────────────────────────────────
  'welcome.aria': {
    en: 'Welcome to CityUHK Hub',
    'zh-CN': '欢迎来到 CityUHK Hub',
    'zh-TW': '歡迎來到 CityUHK Hub',
  },
  'welcome.title': {
    en: 'Welcome to CityUHK Hub 🎉',
    'zh-CN': 'CityUHK Hub 欢迎你 🎉',
    'zh-TW': 'CityUHK Hub 歡迎你 🎉',
  },
  'welcome.lead.a': {
    en: 'We want this to become CityU\u2019s ',
    'zh-CN': '我们想把它做成城大',
    'zh-TW': '我們想把它做成城大',
  },
  'welcome.lead.b': {
    en: 'most complete open-source resource hub',
    'zh-CN': '最完整的开源资源聚合库',
    'zh-TW': '最完整的開源資源聚合庫',
  },
  'welcome.lead.c': {
    en: ', and that depends on your contribution ✨ If your repository is useful to fellow students, add it here so more people can find it.',
    'zh-CN': '，而这件事离不开你的贡献 ✨ 如果你的仓库对同学有用，欢迎放进来，让更多人找到它。',
    'zh-TW': '，而這件事離不開你的貢獻 ✨ 如果你的倉庫對同學有用，歡迎放進來，讓更多人找到它。',
  },
  'welcome.b1.title': {
    en: 'Your name joins the contributors list',
    'zh-CN': '名字进入贡献者名单',
    'zh-TW': '名字進入貢獻者名單',
  },
  'welcome.b1.detail': {
    en: 'Both the contributor wall on the repository homepage and the author ranking on the site will include you',
    'zh-CN': '仓库首页的贡献者墙与站内的作者榜都会记上你',
    'zh-TW': '倉庫首頁的貢獻者牆與站內的作者榜都會記上你',
  },
  'welcome.b2.title': {
    en: 'Your project gets more exposure',
    'zh-CN': '项目获得更多曝光',
    'zh-TW': '專案獲得更多曝光',
  },
  'welcome.b2.detail': {
    en: 'Students can find it by category, tag or language and jump straight to your repository',
    'zh-CN': '同学按分类、标签、语言就能搜到，一键直达你的仓库',
    'zh-TW': '同學按分類、標籤、語言就能搜到，一鍵直達你的倉庫',
  },
  'welcome.b3.title': {
    en: 'It becomes a portfolio piece',
    'zh-CN': '变成可展示的作品',
    'zh-TW': '變成可展示的作品',
  },
  'welcome.b3.detail': {
    en: 'One permanent link, handy for your résumé, coursework and personal homepage',
    'zh-CN': '一个固定链接，方便写进简历、课程作业与个人主页',
    'zh-TW': '一個固定連結，方便寫進履歷、課程作業與個人主頁',
  },
  'welcome.b4.title': {
    en: 'You help the students who come after',
    'zh-CN': '帮到后来的同学',
    'zh-TW': '幫到後來的同學',
  },
  'welcome.b4.detail': {
    en: 'Turn scattered resources into a shared public library everyone can use',
    'zh-CN': '把散落各处的资料，攒成大家都能用的公共资源',
    'zh-TW': '把散落各處的資料，攢成大家都能用的公共資源',
  },
  'welcome.submit': { en: 'Submit my project too', 'zh-CN': '我也要提交项目', 'zh-TW': '我也要提交專案' },
  'welcome.browse': { en: 'Just browsing', 'zh-CN': '先随便看看', 'zh-TW': '先隨便看看' },
  'welcome.neverShow': {
    en: "Don't show again (remember my choice)",
    'zh-CN': '不再提示（记住我的选择）',
    'zh-TW': '不再提示（記住我的選擇）',
  },

  // ── 提交页 ────────────────────────────────────────────────────
  'submitPage.meta.title': {
    en: 'Submit a project · CityUHK Hub',
    'zh-CN': '提交项目 · CityUHK Hub',
    'zh-TW': '提交專案 · CityUHK Hub',
  },
  'submitPage.meta.description': {
    en: "Submit your open-source project to CityUHK Hub: fork this site's repository, switch to the feature branch, then fill in the form after verification.",
    'zh-CN': '提交你的开源项目到 CityUHK Hub：先 fork 本站仓库并切到 feature 分支，验证后填写表单。',
    'zh-TW': '提交你的開源專案到 CityUHK Hub：先 fork 本站倉庫並切到 feature 分支，驗證後填寫表單。',
  },
  'submitPage.back': { en: 'Back to home', 'zh-CN': '返回首页', 'zh-TW': '返回首頁' },
  'submitPage.heading': { en: 'Submit my project too', 'zh-CN': '我也要提交项目', 'zh-TW': '我也要提交專案' },
  'submitPage.step.fork': { en: 'fork verification', 'zh-CN': 'fork 验证', 'zh-TW': 'fork 驗證' },
  'submitPage.step.form': { en: 'fill in the form', 'zh-CN': '填写表单', 'zh-TW': '填寫表單' },

  'fork.title': {
    en: "Step 1: Fork this site's repository and switch to the feature branch",
    'zh-CN': '第一步：先 Fork 本站仓库并切到 feature 分支',
    'zh-TW': '第一步：先 Fork 本站倉庫並切到 feature 分支',
  },
  'fork.desc.a': {
    en: 'Committing requires your own fork; the commit happens on its ',
    'zh-CN': '提交前需要你自己的 fork，提交会发生在它上面的 ',
    'zh-TW': '提交前需要你自己的 fork，提交會發生在它上面的 ',
  },
  'fork.desc.b': {
    en: ' branch. Finish the 3 steps below, then come back to verify.',
    'zh-CN': ' 分支。按下面 3 步完成后再回来验证。',
    'zh-TW': ' 分支。按下面 3 步完成後再回來驗證。',
  },
  'fork.step1': { en: "Fork this site's repository:", 'zh-CN': 'Fork 本站仓库：', 'zh-TW': 'Fork 本站倉庫：' },
  'fork.step2.a': { en: 'In your fork, switch to the ', 'zh-CN': '在 fork 里切到 ', 'zh-TW': '在 fork 裡切到 ' },
  'fork.step2.b': { en: ' branch. Run ', 'zh-CN': ' 分支。本地执行 ', 'zh-TW': ' 分支。本地執行 ' },
  'fork.step2.c': {
    en: " locally, or view the feature branch on the fork's web page, and make sure it matches this site.",
    'zh-CN': '，或直接在 fork 网页上查看 feature 分支，确保它与本站一致。',
    'zh-TW': '，或直接在 fork 網頁上查看 feature 分支，確保它與本站一致。',
  },
  'fork.step3': {
    en: 'Fill in your GitHub username below and click "Confirm forked". Once verified, the username is locked and you can fill in the form.',
    'zh-CN': '填好下面的 GitHub 用户名，点「确认已 fork」。验证通过会锁定用户名，然后进入表单填写。',
    'zh-TW': '填好下面的 GitHub 使用者名稱，點「確認已 fork」。驗證通過會鎖定使用者名稱，然後進入表單填寫。',
  },
  'fork.img1Alt': {
    en: "Click the Fork button on the GitHub page to fork this site's repository",
    'zh-CN': '在 GitHub 页面点击 Fork 按钮，fork 本站仓库',
    'zh-TW': '在 GitHub 頁面點擊 Fork 按鈕，fork 本站倉庫',
  },
  'fork.img1Caption': {
    en: "① Fork this site's repository",
    'zh-CN': '① Fork 本站仓库',
    'zh-TW': '① Fork 本站倉庫',
  },
  'fork.img2Alt': {
    en: 'Switch your fork to the feature branch',
    'zh-CN': '把 fork 切换到 feature 分支',
    'zh-TW': '把 fork 切換到 feature 分支',
  },
  'fork.img2Caption': {
    en: '② Switch to the feature branch',
    'zh-CN': '② 切到 feature 分支',
    'zh-TW': '② 切到 feature 分支',
  },
  'fork.username': { en: 'GitHub username', 'zh-CN': 'GitHub 用户名', 'zh-TW': 'GitHub 使用者名稱' },
  'fork.checking': { en: 'Verifying…', 'zh-CN': '验证中…', 'zh-TW': '驗證中…' },
  'fork.confirm': { en: 'Confirm forked', 'zh-CN': '确认已 fork', 'zh-TW': '確認已 fork' },
  'fork.hint.empty': {
    en: 'Please enter your GitHub username first',
    'zh-CN': '请先填写你的 GitHub 用户名',
    'zh-TW': '請先填寫你的 GitHub 使用者名稱',
  },
  'fork.hint.invalid': {
    en: 'Invalid GitHub username format',
    'zh-CN': 'GitHub 用户名格式不正确',
    'zh-TW': 'GitHub 使用者名稱格式不正確',
  },
  'fork.noFork': {
    en: "@{user} has not forked this site's repository yet. Complete steps 1 and 2 above, then click \u201cConfirm forked\u201d to verify again.",
    'zh-CN': '@{user} 还没有 fork 本站仓库。请先完成上面的第 1、2 步，再回来点「确认已 fork」重新验证。',
    'zh-TW': '@{user} 還沒有 fork 本站倉庫。請先完成上面的第 1、2 步，再回來點「確認已 fork」重新驗證。',
  },
  'fork.recheck': {
    en: "I've forked — verify again",
    'zh-CN': '我已 Fork，重新验证',
    'zh-TW': '我已 Fork，重新驗證',
  },
  'fork.forkRepo': { en: "Fork this site's repository", 'zh-CN': 'Fork 本站仓库', 'zh-TW': 'Fork 本站倉庫' },
  'fork.error': {
    en: "Can't confirm the fork right now (the API may be rate-limited or unavailable).",
    'zh-CN': '暂时无法确认是否已 fork（接口可能限流或不可用）。',
    'zh-TW': '暫時無法確認是否已 fork（介面可能限流或不可用）。',
  },
  'fork.retry': { en: 'Verify again', 'zh-CN': '重新验证', 'zh-TW': '重新驗證' },

  'form.locked': {
    en: 'Confirmed @{user} has forked this site; the username is locked.',
    'zh-CN': '已确认 @{user} 已 fork 本站，用户名已锁定不可修改。',
    'zh-TW': '已確認 @{user} 已 fork 本站，使用者名稱已鎖定不可修改。',
  },
  'form.changeUser': { en: 'Change username', 'zh-CN': '更换用户名', 'zh-TW': '更換使用者名稱' },
  'form.tooLong': {
    en: 'The content is too long to carry to the fork in one go — please shorten the project description and try again',
    'zh-CN': '内容太长，无法一次性带到 fork，请精简项目介绍后再提交',
    'zh-TW': '內容太長，無法一次性帶到 fork，請精簡專案介紹後再提交',
  },
  'form.done.lead.a': {
    en: "Opened a new file on your fork's ",
    'zh-CN': '已打开你 fork 的 ',
    'zh-TW': '已開啟你 fork 的 ',
  },
  'form.done.lead.b': {
    en: ' branch with the content pre-filled. Follow the 3 steps below to turn it into a Pull Request back to this site.',
    'zh-CN': ' 分支新建文件，内容已预填。按下面 3 步操作，就能把你的项目提交成回本站的 Pull Request。',
    'zh-TW': ' 分支新建檔案，內容已預填。按下面 3 步操作，就能把你的專案提交成回本站的 Pull Request。',
  },
  'form.step1.title': { en: '① Commit in your fork', 'zh-CN': '① 在你的 fork 里提交', 'zh-TW': '① 在你的 fork 裡提交' },
  'form.step1.a': {
    en: 'On the page that just opened, review the content (new file ',
    'zh-CN': '在刚打开的页面里看看内容（新文件 ',
    'zh-TW': '在剛開啟的頁面裡看看內容（新檔案 ',
  },
  'form.step1.b': {
    en: '), scroll to the bottom, write a commit message (e.g. add project xxx) and click ',
    'zh-CN': '），滚动到底部，写一句提交说明（如新增项目 xxx），点',
    'zh-TW': '），滾動到底部，寫一句提交說明（如新增專案 xxx），點',
  },
  'form.step1.c': {
    en: '. This commits to your ',
    'zh-CN': '。这会提交到你自己的',
    'zh-TW': '。這會提交到你自己的',
  },
  'form.step1.d': { en: ' branch.', 'zh-CN': ' 分支。', 'zh-TW': ' 分支。' },
  'form.openFile': { en: 'Open the new-file page', 'zh-CN': '打开新建文件页', 'zh-TW': '開啟新建檔案頁' },
  'form.step2.title': { en: '② Compare branches', 'zh-CN': '② Compare（对比分支）', 'zh-TW': '② Compare（對比分支）' },
  'form.step2.a': {
    en: "Back on your fork's homepage, GitHub shows \u201cThis branch is N commits ahead of",
    'zh-CN': '回到你的 fork 首页，GitHub 会在顶部提示「This branch is N commits ahead of',
    'zh-TW': '回到你的 fork 首頁，GitHub 會在頂部提示「This branch is N commits ahead of',
  },
  'form.step2.b': {
    en: '\u201d at the top — click ',
    'zh-CN': '」，点',
    'zh-TW': '」，點',
  },
  'form.step2.c': {
    en: '; or use the compare link below, keeping base = this site\u2019s ',
    'zh-CN': '；或直接点下面的对比入口，保持 base = 本站 ',
    'zh-TW': '；或直接點下面的對比入口，保持 base = 本站 ',
  },
  'form.step2.d': { en: ', compare = your fork\u2019s ', 'zh-CN': '、compare = 你的 fork ', 'zh-TW': '、compare = 你的 fork ' },
  'form.step2.e': { en: '.', 'zh-CN': '。', 'zh-TW': '。' },
  'form.openCompare': { en: 'Open the Compare page', 'zh-CN': '打开 Compare 页面', 'zh-TW': '開啟 Compare 頁面' },
  'form.step3.title': { en: '③ Submit the Pull Request', 'zh-CN': '③ 提交 Pull Request', 'zh-TW': '③ 提交 Pull Request' },
  'form.step3.desc.a': {
    en: 'Once the compare page looks right, fill in a title and description and click ',
    'zh-CN': '对比页面确认无误后，填上标题与说明，点 ',
    'zh-TW': '對比頁面確認無誤後，填上標題與說明，點 ',
  },
  'form.step3.desc.b': {
    en: '. After the maintainer reviews and merges it into ',
    'zh-CN': '。维护者 review 并合并到 ',
    'zh-TW': '。維護者 review 並合併到 ',
  },
  'form.step3.desc.c': {
    en: ', the site will list your project automatically (and you get a badge).',
    'zh-CN': ' 后，网站会自动收录你的项目（顺带会拿到徽章）。',
    'zh-TW': ' 後，網站會自動收錄你的專案（順帶會拿到徽章）。',
  },
  'form.doneInCompare': { en: 'Done on the Compare page', 'zh-CN': '已在 Compare 页面', 'zh-TW': '已在 Compare 頁面' },
  'form.submitAnother': { en: 'Submit another', 'zh-CN': '再提交一个', 'zh-TW': '再提交一個' },
  'form.restart': { en: 'Verify fork again', 'zh-CN': '重新验证 fork', 'zh-TW': '重新驗證 fork' },

  'form.field.title': { en: 'Project name', 'zh-CN': '项目名称', 'zh-TW': '專案名稱' },
  'form.field.author': { en: 'GitHub username', 'zh-CN': 'GitHub 用户名', 'zh-TW': 'GitHub 使用者名稱' },
  'form.field.authorName': { en: 'Real name', 'zh-CN': '真实姓名', 'zh-TW': '真實姓名' },
  'form.field.major': { en: 'Major', 'zh-CN': '专业', 'zh-TW': '專業' },
  'form.field.year': { en: 'Enrollment year', 'zh-CN': '入学年份', 'zh-TW': '入學年份' },
  'form.field.repoUrl': { en: 'Repository URL', 'zh-CN': '仓库地址', 'zh-TW': '倉庫位址' },
  'form.field.demo': { en: 'Demo URL', 'zh-CN': 'Demo 地址', 'zh-TW': 'Demo 位址' },
  'form.field.category': { en: 'Category', 'zh-CN': '分类', 'zh-TW': '分類' },
  'form.field.tags': { en: 'Tags', 'zh-CN': '标签', 'zh-TW': '標籤' },
  'form.field.tagsHint': {
    en: 'Comma-separated, up to 12, each at most 16 characters',
    'zh-CN': '逗号分隔，最多 12 个，每个最长 16 字符',
    'zh-TW': '逗號分隔，最多 12 個，每個最長 16 字元',
  },
  'form.field.summary': { en: 'Summary', 'zh-CN': '摘要', 'zh-TW': '摘要' },
  'form.field.summaryPlaceholder': {
    en: 'One sentence about the project',
    'zh-CN': '一句话说明这个项目',
    'zh-TW': '一句話說明這個專案',
  },
  'form.field.summaryHint': {
    en: 'Up to 600 characters, shown on the card',
    'zh-CN': '最长 600 字，会显示在卡片上',
    'zh-TW': '最長 600 字，會顯示在卡片上',
  },
  'form.field.intro': { en: 'Project introduction', 'zh-CN': '项目介绍', 'zh-TW': '專案介紹' },
  'form.field.introPlaceholder': {
    en: 'What problem it solves, and who it is for',
    'zh-CN': '它解决什么问题、适合谁使用',
    'zh-TW': '它解決什麼問題、適合誰使用',
  },
  'form.field.features': {
    en: 'Features (one per line, optional)',
    'zh-CN': 'Features（每行一条，可留空）',
    'zh-TW': 'Features（每行一條，可留空）',
  },
  'form.field.featuresPlaceholder': { en: 'Feature one\nFeature two', 'zh-CN': '功能一\n功能二', 'zh-TW': '功能一\n功能二' },
  'form.field.demoPlaceholder': {
    en: 'Leave empty if none',
    'zh-CN': '没有就留空',
    'zh-TW': '沒有就留空',
  },
  'form.field.categoryPlaceholder': {
    en: 'Study aid / Productivity …',
    'zh-CN': '学习辅助 / 效率工具 …',
    'zh-TW': '學習輔助 / 效率工具 …',
  },
  'form.field.namePlaceholder': { en: 'My Project', 'zh-CN': '我的项目', 'zh-TW': '我的專案' },
  'form.field.authorNamePlaceholder': { en: 'Your name', 'zh-CN': '你的姓名', 'zh-TW': '你的姓名' },
  'form.field.majorPlaceholder': { en: 'Computer Science', 'zh-CN': '计算机科学', 'zh-TW': '電腦科學' },
  'form.lockHint': {
    en: 'Locked to @{user}; click "Change username" above to change it',
    'zh-CN': '锁定为 @{user}，更换请点上方「更换用户名」',
    'zh-TW': '鎖定為 @{user}，更換請點上方「更換使用者名稱」',
  },
  'form.generate': { en: 'Generate submission link', 'zh-CN': '生成提交链接', 'zh-TW': '產生提交連結' },
  'form.prev': { en: 'Previous step', 'zh-CN': '上一步', 'zh-TW': '上一步' },
  'form.requiredNote': {
    en: 'Fields marked * are required — make sure the repository is public before submitting',
    'zh-CN': '带 * 为必填，提交前请确认仓库是公开的',
    'zh-TW': '帶 * 為必填，提交前請確認倉庫是公開的',
  },

  // 表单校验
  'validate.required': { en: 'Please fill in {label}', 'zh-CN': '请填写{label}', 'zh-TW': '請填寫{label}' },
  'validate.year': {
    en: 'Enrollment year must be an integer between 2000 and 2100',
    'zh-CN': '入学年份必须是 2000–2100 之间的整数',
    'zh-TW': '入學年份必須是 2000–2100 之間的整數',
  },
  'validate.repoUrl': {
    en: 'Repository URL must look like https://github.com/owner/repo',
    'zh-CN': '仓库地址必须是 https://github.com/owner/repo 形式',
    'zh-TW': '倉庫位址必須是 https://github.com/owner/repo 形式',
  },
  'validate.tagsMax': { en: 'At most 12 tags', 'zh-CN': '标签最多 12 个', 'zh-TW': '標籤最多 12 個' },
  'validate.tagLength': {
    en: 'Each tag can be at most 16 characters',
    'zh-CN': '单个标签最长 16 个字符',
    'zh-TW': '單個標籤最長 16 個字元',
  },
  'validate.titleMax': {
    en: 'Project name can be at most 200 characters',
    'zh-CN': '项目名称最长 200 个字符',
    'zh-TW': '專案名稱最長 200 個字元',
  },
  'validate.authorNameMax': {
    en: 'Real name can be at most 120 characters',
    'zh-CN': '真实姓名最长 120 个字符',
    'zh-TW': '真實姓名最長 120 個字元',
  },
  'validate.majorMax': { en: 'Major can be at most 120 characters', 'zh-CN': '专业最长 120 个字符', 'zh-TW': '專業最長 120 個字元' },
  'validate.summaryMax': { en: 'Summary can be at most 600 characters', 'zh-CN': '摘要最长 600 个字符', 'zh-TW': '摘要最長 600 個字元' },
  'validate.categoryMax': { en: 'Category can be at most 80 characters', 'zh-CN': '分类最长 80 个字符', 'zh-TW': '分類最長 80 個字元' },

  // ── 404 ──────────────────────────────────────────────────────
  'notfound.meta.title': { en: 'Page not found · CityUHK Hub', 'zh-CN': '页面不存在 · CityUHK Hub', 'zh-TW': '頁面不存在 · CityUHK Hub' },
  'notfound.meta.description': {
    en: "This address doesn't match any project — the link may be wrong, or the project was removed.",
    'zh-CN': '这个地址没有对应的项目，可能是链接有误或项目已被移除。',
    'zh-TW': '這個位址沒有對應的專案，可能是連結有誤或專案已被移除。',
  },
  'notfound.title': { en: 'Page not found', 'zh-CN': '页面不存在', 'zh-TW': '頁面不存在' },
  'notfound.description': {
    en: "This address doesn't match any project — the link may be mistyped, or the project was removed.",
    'zh-CN': '这个地址没有对应的项目，可能是链接写错了，或者项目已经被移除。',
    'zh-TW': '這個位址沒有對應的專案，可能是連結寫錯了，或者專案已經被移除。',
  },

  // ── 数据层提示 ────────────────────────────────────────────────
  'data.loadError': { en: 'Failed to load data', 'zh-CN': '数据加载失败', 'zh-TW': '資料載入失敗' },
  'data.loadErrorWithStatus': {
    en: 'Failed to load data ({status}): {url}',
    'zh-CN': '数据加载失败（{status}）：{url}',
    'zh-TW': '資料載入失敗（{status}）：{url}',
  },
  'data.missingId': { en: 'Missing project id', 'zh-CN': '缺少项目 id', 'zh-TW': '缺少專案 id' },
  'time.unknown': { en: 'Unknown', 'zh-CN': '未知', 'zh-TW': '未知' },
  'time.justNow': { en: 'just now', 'zh-CN': '刚刚', 'zh-TW': '剛剛' },
  'time.minutesAgo': { en: '{count}m ago', 'zh-CN': '{count}分钟前', 'zh-TW': '{count}分鐘前' },
  'time.hoursAgo': { en: '{count}h ago', 'zh-CN': '{count}小时前', 'zh-TW': '{count}小時前' },
  'time.daysAgo': { en: '{count}d ago', 'zh-CN': '{count}天前', 'zh-TW': '{count}天前' },
  'time.monthsAgo': { en: '{count}mo ago', 'zh-CN': '{count}个月前', 'zh-TW': '{count}個月前' },
  'time.yearsAgo': { en: '{count}y ago', 'zh-CN': '{count}年前', 'zh-TW': '{count}年前' },

  // ── 像素宠物（彩蛋，但提示语仍随语言走） ──────────────────────
  'pet.title': {
    en: 'Pixel cat: click to try',
    'zh-CN': '像素猫咪：点一下试试',
    'zh-TW': '像素貓咪：點一下試試',
  },

  // <<< EXTENSION: common >>>
  // <<< EXTENSION: home >>>
  // <<< EXTENSION: project >>>
};
