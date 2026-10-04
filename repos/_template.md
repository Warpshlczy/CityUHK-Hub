---
# ── 简体中文 ──────────────────────────────────────────────
# 把本模板复制为 repos/你的项目名.md，删掉注释行后填写字段（注释行不影响构建）
#
# 必填
#   title             项目名称
#   author            你的 GitHub 用户名
#   authorName        你的真实姓名
#   major             你的专业
#   enrollmentYear    入学年份，整数，2000–2100
#   repoUrl           公开仓库地址，必须以 https://github.com/ 开头
#
# 可选（不写就用默认值）
#   id                项目 id（用于详情页链接与产物文件名），不写则按 owner-repo 自动生成；
#                     只能用小写字母、数字、中文与 . -，最长 80 字符
#   summary           摘要，最长 600 字
#   homepageUrl       项目 demo 地址，没有就留空 ''
#   tags              最多 12 个，每个最长 16 字符（会自动转小写）
#   category          分类，最长 80 字
#   language          仓库母语，只能填 zh-CN、zh-TW、en 之一，默认 zh-CN；选定后以它为准自动翻译另外两种语言
#   featured          true / false，默认 false
#
# 固定取值
#   status            只能填 active、hidden、archived 之一，默认 active；hidden 的项目不展示
#
# 不要写上面没列出的字段，多写会校验失败；id 与 repoUrl 不能和已有项目重复
# 正文写在 front matter 之后：介绍你的项目，`## 功能` 段落可选
#
# ── 繁體中文 ──────────────────────────────────────────────
# 把本模板複製為 repos/你的專案名.md，刪掉註解行後填寫欄位（註解行不影響建置）
#
# 必填
#   title             專案名稱
#   author            你的 GitHub 使用者名稱
#   authorName        你的真實姓名
#   major             你的主修
#   enrollmentYear    入學年份，整數，2000–2100
#   repoUrl           公開儲存庫位址，必須以 https://github.com/ 開頭
#
# 可選（不寫就用預設值）
#   id                專案 id（用於詳情頁連結與產物檔名），不寫則依 owner-repo 自動產生；
#                     只能用小寫字母、數字、中文與 . -，最長 80 字元
#   summary           摘要，最長 600 字
#   homepageUrl       專案 demo 位址，沒有就留空 ''
#   tags              最多 12 個，每個最長 16 字元（會自動轉小寫）
#   category          分類，最長 80 字
#   language          倉庫母語，只能填 zh-CN、zh-TW、en 之一，預設 zh-CN；選定後以它為準自動翻譯另外兩種語言
#   featured          true / false，預設 false
#
# 固定取值
#   status            只能填 active、hidden、archived 之一，預設 active；hidden 的專案不顯示
#
# 不要寫上面沒列出的欄位，多寫會驗證失敗；id 與 repoUrl 不能和已有專案重複
# 正文寫在 front matter 之後：介紹你的專案，`## 功能` 段落可選
#
# ── English ──────────────────────────────────────────────
# Copy this template to repos/your-project.md, delete the comment lines, then fill in the fields
# (comment lines do not affect the build).
#
# Required
#   title             project name
#   author            your GitHub username
#   authorName        your real name
#   major             your major
#   enrollmentYear    enrollment year, integer, 2000–2100
#   repoUrl           public repository URL, must start with https://github.com/
#
# Optional (the default applies when omitted)
#   id                project id (used by the detail page URL and the output file name); when omitted it
#                     is generated from owner-repo; lowercase letters, digits, CJK and . - only, max 80
#   summary           summary, at most 600 characters
#   homepageUrl       demo URL, leave it empty as '' when there is none
#   tags              at most 12 tags, 16 characters each (lowercased automatically)
#   category          category, at most 80 characters
#   language          the repository's native language: one of zh-CN, zh-TW, en; defaults to zh-CN.
#                     The other two languages are auto-translated from it.
#   featured          true / false, defaults to false
#
# Fixed values
#   status            must be one of active, hidden, archived; defaults to active, and hidden projects are not shown
#
# Do not add fields that are not listed above — extra fields fail validation. id and repoUrl must be
# unique across projects. The body goes below the front matter: describe your project, and the
# `## Features` section is optional.
title: My Project
author: your-github-name
authorName: 你的姓名
major: 你的专业
enrollmentYear: 2024
repoUrl: https://github.com/owner/repository
homepageUrl: ''
tags:
  - example
category: other
language: zh-CN
featured: false
status: active
---

在这里介绍你的项目：它解决什么问题、适合谁使用，以及最重要的功能。

## Features

- 功能一
- 功能二