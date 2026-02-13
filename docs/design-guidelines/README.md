# Audio Label Pro - 设计指南

> **版本**: v1.0.0
> **创建日期**: 2026-02-13
> **产品类型**: SaaS

---

## 📚 设计指南文档索引

本目录包含 Audio Label Pro 的完整设计指南文档，涵盖设计原则、交互规范、布局规则和技术配置。

### 文档列表

| 文档 | 描述 | 优先级 |
|------|------|--------|
| [设计原则](./01-principles.md) | 核心设计价值观和指导原则 | ⭐⭐⭐ |
| [交互规范](./02-interaction.md) | 用户交互模式和反馈机制 | ⭐⭐⭐ |
| [布局规范](./03-layout.md) | 栅格系统和页面布局模式 | ⭐⭐ |
| [技术配置](./04-config.md) | 设计 Token 和 CSS 配置 | ⭐⭐ |

---

## 🎨 设计系统概览

### 核心设计风格

- **风格**: Minimalism & Swiss Style
- **关键词**: 简洁、专业、高效、可信
- **适用场景**: 企业应用、数据仪表板、协作平台

### 颜色系统

| 色彩 | 主色 | 辅助色 | 强调色 | 背景色 | 文本色 |
|------|------|--------|--------|--------|--------|
| 色值 | `#059669` | `#10B981` | `#F97316` | `#ECFDF5` | `#064E3B` |

### 字体系统

- **无衬线字体**: Poppins（主要字体）
- **衬线字体**: Open Sans（次要字体）
- **等宽字体**: Fira Code（代码）

### 间距系统

- 基础间距: 4px
- 间距比例: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px

---

## 🚀 快速开始

### 第一步：阅读设计原则

从 [设计原则](./01-principles.md) 开始，了解 Audio Label Pro 的核心价值观和设计理念。

### 第二步：了解交互规范

阅读 [交互规范](./02-interaction.md)，学习如何实现流畅的用户交互和反馈机制。

### 第三步：掌握布局规则

参考 [布局规范](./03-layout.md)，了解栅格系统和响应式设计策略。

### 第四步：配置技术实现

查看 [技术配置](./04-config.md)，获取 CSS Variables 和组件样式实现代码。

---

## 📖 使用指南

### 设计师

1. 阅读 [设计原则](./01-principles.md) 理解设计理念
2. 参考 [交互规范](./02-interaction.md) 创建交互原型
3. 使用 [布局规范](./03-layout.md) 设计页面布局
4. 遵循设计系统 [JSON 配置](../design-system.json) 使用精确的颜色和间距值

### 开发者

1. 阅读 [设计原则](./01-principles.md) 理解设计理念
2. 查看 [交互规范](./02-interaction.md) 实现交互逻辑
3. 参考 [布局规范](./03-layout.md) 构建页面结构
4. 使用 [技术配置](./04-config.md) 获取 CSS 代码和组件样式

### 产品经理

1. 阅读 [设计原则](./01-principles.md) 了解设计理念
2. 参考 [交互规范](./02-interaction.md) 编写产品需求
3. 遵循设计系统确保产品一致性

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

## 📊 设计 Token

### 颜色 Token

```css
/* Primary */
--color-primary-50: #ECFDF5;
--color-primary-100: #D1FAE5;
--color-primary-200: #A7F3D0;
--color-primary-300: #6EE7B7;
--color-primary-400: #34D399;
--color-primary-500: #10B981;
--color-primary-600: #059669;
--color-primary-700: #047857;
--color-primary-800: #065F46;
--color-primary-900: #064E3B;
```

### 字体 Token

```css
/* Font Family */
--font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-serif: 'Open Sans', Georgia, 'Cambria', 'Times New Roman', Times, serif;
--font-mono: 'Fira Code', Consolas, Monaco, 'Courier New', monospace;

/* Font Size */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

### 间距 Token

```css
/* Spacing */
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
--spacing-32: 128px;
```

---

## 🔄 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-02-13 | 初始版本 |

---

## 📞 联系方式

如有设计问题或建议，请联系设计团队。

---

**文档结束**