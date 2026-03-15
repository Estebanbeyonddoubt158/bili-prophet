# B站先知

> 看视频前先知道值不值得看。AI 自动分析字幕，主页封面直出评级 + 概述 + 关键点，进度条标注时间轴。

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-Install-brightgreen)](https://greasyfork.org/zh-CN/scripts/569780-b%E7%AB%99%E5%85%88%E7%9F%A5) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 预览

![主页AI总结遮罩](images/1.png)

![评级徽章](images/2.png)


![设置面板](images/4.jpg)

![复制功能](images/5.jpg)

## 功能

### 主页智能预览
- 后台自动分析主页、搜索页、排行榜、UP主空间的视频
- 封面直接显示**评级**（值得看 / 一般 / 不值得看）、概述、关键点、时间节点
- 鼠标移开后评级徽章保留在封面左上角
- 深度渐变 + 双层文字阴影，任何封面颜色下都清晰可读

### 一键复制
- 悬停封面显示 AI 总结
- 「复制」按钮将评级 + 概述 + 关键点一键写入剪贴板
- 章节标签可点击，直接跳转到对应时间点

### 进度条时间轴
- 视频详情页进度条上自动标注 AI 分析出的关键时间节点
- 蓝色竖线 + 标签 + 箭头，始终显示
- 点击标签直接跳转，支持 SPA 路由

### 缓存与配置
- IndexedDB 本地缓存，默认 7 天有效期
- 自定义 LLM 接口（endpoint / API Key / 模型）
- 油猴菜单 → ⚙️ 设置面板

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. 点击 [安装脚本](https://greasyfork.org/zh-CN/scripts/569780-b%E7%AB%99%E5%85%88%E7%9F%A5)
3. 打开设置面板，填入 LLM API 地址和 Key
4. 回到 B站主页，等待封面出现评级标记

## 要求

- Tampermonkey（Chrome / Edge / Firefox）
- OpenAI 兼容格式的 LLM API（支持流式输出）
- 视频需有 CC 字幕

## 配置项

| 配置 | 说明 | 默认值 |
|------|------|--------|
| LLM Endpoint | API 地址 | - |
| API Key | 密钥 | - |
| 模型 | 模型名称 | - |
| 触发方式 | 悬停延迟 | 800ms |
| 自动预加载 | 并发数 | 2 |
| 缓存有效期 | 天数 | 7天 |

## License

MIT

## 版本历史

### v1.2.0
- 修复：鼠标移到标题/UP主区域时 overlay 不消失（将检测范围从整个卡片收窄至封面图）
- 修复：鼠标反复悬停时重复触发请求，新增「取消后冷却时间」配置（默认 10s，可在设置面板自定义）
- 优化：AI 总结内容随封面尺寸实时自适应，字体改用 CSS Container Query `cqh` 单位，彻底告别 JS 快照计算
- 优化：内容块（概述 / 关键点 / 章节）改由 `@container` 规则控制显隐，窗口缩放/列数切换即时响应
- 优化：新增 ResizeObserver 监听封面尺寸变化，visible 状态下自动重渲染内容密度
- 优化：内容块加 flex-shrink 防止撑破容器，任何分辨率下不再出现内容溢出
- 重命名：脚本文件名更新为 bilibili-prophet.user.js

### v1.1.0
- 初始发布版本
