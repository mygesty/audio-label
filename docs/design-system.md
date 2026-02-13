# Audio Label Pro - 设计系统

> **版本**: v1.0.0
> **创建日期**: 2026-02-13
> **产品类型**: SaaS

---

## 🎨 核心设计推荐

```
+------------------------------------------------------------------------------------------+
|  TARGET: SaaS - RECOMMENDED DESIGN SYSTEM                                                |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  PATTERN: Minimalism & Swiss Style                                                       |
|     Keywords: Clean, simple, spacious, functional, white space, high contrast,           |
|     geometric, sans-serif                                                                |
|     Best For: Enterprise apps, dashboards, data-intensive platforms                       |
|     Performance: ⚡ Excellent | Accessibility: ✓ WCAG AAA                                 |
|                                                                                          |
|  COLORS:                                                                                 |
|     Primary:    #059669 (Success Green)                                                  |
|     Secondary:  #10B981 (Lighter Green)                                                  |
|     CTA:        #F97316 (Urgency Orange)                                                 |
|     Background: #ECFDF5 (Light Green Tint)                                               |
|     Text:       #064E3B (Dark Green)                                                     |
|     Notes: Success green + urgency orange | Color guard applied: avoid blue/purple       |
|     unless explicitly requested                                                          |
|                                                                                          |
|  TYPOGRAPHY: Poppins / Open Sans                                                         |
|     Mood: modern, professional, clean, corporate, friendly, approachable                 |
|     Best For: SaaS, corporate sites, business apps                                       |
|     Google Fonts: https://fonts.google.com/share?selection?family=Poppins                |
|                                                                                          |
|  KEY EFFECTS:                                                                            |
|     Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type       |
|     hierarchy, fast loading                                                              |
|                                                                                          |
|  AVOID (Anti-patterns):                                                                  |
|     - Overusing animations                                                              |
|     - Information overload                                                              |
|     - Inconsistent interactions                                                         |
|     - Lack of feedback                                                                  |
|     - Low contrast                                                                       |
|     - Excessive decoration                                                              |
|                                                                                          |
|  PRE-DELIVERY CHECKLIST:                                                                 |
|     [x] No emojis as icons (use SVG: Heroicons/Lucide)                                   |
|     [x] cursor-pointer on all clickable elements                                         |
|     [x] Hover states with smooth transitions (200-250ms)                                 |
|     [x] Light mode: text contrast 4.5:1 minimum                                          |
|     [x] Focus states visible for keyboard nav                                            |
|     [x] prefers-reduced-motion respected                                                 |
|     [x] Responsive: 375px, 768px, 1024px, 1440px                                         |
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

---

## 📊 设计系统概览

### 核心设计风格

- **风格**: Minimalism & Swiss Style（极简主义 + 瑞士风格）
- **关键词**: 简洁、专业、高效、可信
- **适用场景**: 企业应用、数据仪表板、协作平台
- **性能**: ⚡ 优秀
- **可访问性**: ✓ WCAG AAA 标准

### 颜色系统

| 色彩 | 主色 | 辅助色 | 强调色 | 背景色 | 文本色 |
|------|------|--------|--------|--------|--------|
| 色值 | `#059669` | `#10B981` | `#F97316` | `#ECFDF5` | `#064E3B` |
| 说明 | 成功绿 | 浅绿 | 紧急橙 | 浅绿背景 | 深绿文本 |

### 字体系统

- **无衬线字体**: Poppins（主要字体）
  - 风格: 现代、专业、清晰
  - 适用: 标题、正文、UI 文本
- **衬线字体**: Open Sans（次要字体）
  - 风格: 友好、易读
  - 适用: 长文本、说明文字
- **等宽字体**: Fira Code（代码）
  - 风格: 等宽、清晰
  - 适用: 代码、数据展示

### 间距系统

- 基础间距: 4px
- 间距比例: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px

---

## 📁 文档索引

### 设计指南文档

| 文档 | 描述 | 优先级 |
|------|------|--------|
| [设计原则](./design-guidelines/01-principles.md) | 核心设计价值观和指导原则 | ⭐⭐⭐ |
| [交互规范](./design-guidelines/02-interaction.md) | 用户交互模式和反馈机制 | ⭐⭐⭐ |
| [布局规范](./design-guidelines/03-layout.md) | 栅格系统和页面布局模式 | ⭐⭐ |
| [技术配置](./design-guidelines/04-config.md) | 设计 Token 和 CSS 配置 | ⭐⭐ |

### 设计配置文件

| 文件 | 描述 |
|------|------|
| [design-system.json](./design-system.json) | 设计系统 JSON 配置文件 |

### 原型设计文档

| 文档 | 描述 |
|------|------|
| [原型索引](./prototype/prototype-index.md) | 原型设计索引 |
| [登录页原型](./prototype/page-登录页.md) | 登录页原型设计 |
| [首页原型](./prototype/page-首页.md) | 首页原型设计 |
| [音频列表原型](./prototype/page-音频列表.md) | 音频列表原型设计 |
| [标注界面原型](./prototype/page-标注界面.md) | 标注界面原型设计 ⭐ |
| [审核界面原型](./prototype/page-审核界面.md) | 审核界面原型设计 |
| [任务列表原型](./prototype/page-任务列表.md) | 任务列表原型设计 |

### 产品需求文档

| 文档 | 描述 |
|------|------|
| [产品需求文档](./prd/product-requirements.md) | Audio Label Pro 产品需求文档 |

---

## 🚀 快速开始

### 第一步：阅读设计原则

从 [设计原则](./design-guidelines/01-principles.md) 开始，了解 Audio Label Pro 的核心价值观和设计理念。

### 第二步：了解交互规范

阅读 [交互规范](./design-guidelines/02-interaction.md)，学习如何实现流畅的用户交互和反馈机制。

### 第三步：掌握布局规则

参考 [布局规范](./design-guidelines/03-layout.md)，了解栅格系统和响应式设计策略。

### 第四步：配置技术实现

查看 [技术配置](./design-guidelines/04-config.md)，获取 CSS Variables 和组件样式实现代码。

### 第五步：查看原型

浏览 [原型设计](./prototype/prototype-index.md)，了解各页面的详细布局和交互设计。

---

## 🎯 设计原则总结

### 核心价值观

1. **专业性**: 设计简洁、高效、专业
2. **可信度**: 使用稳定的颜色和清晰的层次
3. **高效性**: 优化用户工作流程，减少操作步骤
4. **可访问性**: 符合 WCAG AAA 标准

### 设计目标

- 提供高效的数据标注工具
- 支持多人实时协作
- 优化长音频处理体验
- 确保数据质量和可控性

---

## 📐 布局系统

### 栅格系统

- 基于 12 列栅格系统
- 基础间距: 16px
- 响应式断点: 640px, 768px, 1024px, 1280px, 1536px

### 常见布局

- **单栏布局**: 登录页、注册页
- **双栏布局**: 标注界面、审核界面
- **三栏布局**: 数据仪表板、统计报表

---

## 🎨 组件样式

### 按钮

```css
/* Primary Button */
.btn-primary {
  background-color: #059669;
  color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  transition: 200ms ease-in-out;
}

.btn-primary:hover {
  background-color: #047857;
}
```

### 输入框

```css
.input {
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  padding: 0.75rem;
  transition: 200ms ease-in-out;
}

.input:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
```

### 卡片

```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## 🔄 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-02-13 | 初始版本，完成设计系统定义 |

---

## 📞 联系方式

如有设计问题或建议，请联系设计团队。

---

## 🔗 相关资源

- [Google Fonts - Poppins](https://fonts.google.com/share?selection?family=Poppins)
- [Google Fonts - Open Sans](https://fonts.google.com/share?selection?family=Open+Sans)
- [WCAG 2.1 标准](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Icons](https://fonts.google.com/icons)
- [Heroicons](https://heroicons.com/)

---

**文档结束**