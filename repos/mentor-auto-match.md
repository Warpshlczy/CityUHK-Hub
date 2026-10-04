---
title: MentorMatch · 导师匹配助手
author: Warpshlczy
authorName: Mokie·正一
major: 计算机科学
enrollmentYear: 2026
repoUrl: https://github.com/Warpshlczy/mentors-auto-match
homepageUrl: ''
tags:
  - msc-cs
  - mentors
  - phd
  - llm
  - master
  - cv
  - match
  - python
  - thesis
  - automation
category: 科研工具
language: zh-CN
featured: false
status: active
---
🏹 保研申博？一键迅速拿捏目标导师
MentorMatch 是给同学选导师用的桌面应用：把简历或研究计划丢进去，选硕士还是博士，它会从 CSRankings 捞一批候选导师逐个算匹配度，最后按分数排好，告诉你该先给谁发邮件。

## 功能

- **匹配度分高/中/低**，并给出重合的关键词和理由；开了 LLM 能识别同一个意思的不同说法
- **导师信息**：姓名、院系、个人主页、ORCID，以及近 5 年发表的会议领域
- **本地缓存**：SQLite 存着，抓过的导师不重复抓，之后换勾选院校也不用重来；抓取随时可取消，已抓到的记录保留
- **可选 LLM**：填 OpenAI 兼容端点即可（本地 Ollama，或百炼、DeepSeek、智谱这些云端服务），不填就退回 RapidFuzz 离线关键词匹配
- **暂时只覆盖计算机**：CSRankings 按计算机顶会收录导师，所以视觉、自然语言处理、机器学习、系统、安全这些方向数据比较全，生化环材和人文社科暂时没有

