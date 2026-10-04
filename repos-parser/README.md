# CityUHK Hub 仓库文档解析器

把作者提交的 `repos/*.md` 解析成前端**直接可读**的静态 JSON，输出到 `web/public/data/`。
这里没有 HTTP 接口，也没有中间数据层——解析产物就是站点数据。

## 工作流

```text
作者编辑 repos/<id>.md
        │
        │ Pull Request（目标分支 feature）
        ▼
validate-repos.mjs 校验 front matter、Schema、重复 ID 与重复仓库
        │
        │ 合并到 main
        ▼
build-index.mjs 生成 web/public/data/*.json
        │
        ▼
web 的 npm run build 打包 web/dist，由自建服务器发布
```

只有合并到 `main` 的内容才会进入构建；PR 不直接发布网页内容。

## 本地命令

使用 Node.js `>=20.6.0`。依赖由根目录的 npm workspaces 统一安装，先在仓库根目录执行 `npm install`。

```bash
npm run validate       # 校验 repos/*.md 的 front matter、Schema 和重复项
npm run build:offline  # 不访问 GitHub，仅用本地 Markdown 解析（推荐）
npm run build          # 访问 GitHub，补充仓库信息与 README 回退内容
npm test               # 运行解析器测试
```

也可以在仓库根目录用 `npm run validate` / `npm test` 直接调用上面的同名命令。

联网解析会读取公开仓库的描述、stars、语言、topics、许可证、默认分支与 README，
可选地在 `repos-parser/.env` 中配置 `GITHUB_TOKEN`（见 `.env.example`）以避免匿名限流。

## 输入和产物

输入文件格式见根目录 `repos/_template.md`：每个文件包含 YAML front matter 和 Markdown 正文。

作者信息字段：`author` 是 GitHub 用户名，`authorName` 是展示用姓名，`major` 是专业，
`enrollmentYear` 是四位入学年份；后三项均为必填。

产物写入 `web/public/data/`（可用 `OUTPUT_DIR` 覆盖），该目录已被 gitignore：

- `projects.json`：项目列表 + 标签 / 作者 / 分类聚合，不含正文
- `projects/<id>.json`：单个项目详情，含渲染好的 `readmeHtml`

`readmeHtml` 用 marked 渲染后再做一次 XSS 清理（去掉 `<script>`、内联事件与 `javascript:` 链接），
因此前端不需要再引 markdown 依赖或 `dangerouslySetInnerHTML` 之外的额外处理。

`web/public/data/` 是构建产物，不是作者编辑入口，也不应成为新的数据源。

## 目录

```text
repos-parser/
├── src/
│   ├── build-index.mjs       解析入口：repos/*.md → web/public/data/*.json
│   ├── validate-repos.mjs    PR 数据校验入口
│   ├── config.js             GitHub 访问配置
│   └── lib/
│       ├── aggregate.js      标签、作者、分类聚合
│       ├── frontmatter.js    YAML front matter 解析
│       ├── github.js         GitHub 仓库元数据客户端
│       ├── markdown.js       Markdown 信息分析
│       └── slug.js           项目 ID 生成
└── test/
    └── build-index.test.mjs  解析器测试
```

作者提交规则见根目录 `CONTRIBUTING.md`。Schema 位于 `schema/repo.schema.json`。
