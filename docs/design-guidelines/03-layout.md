# 布局规范

> **Audio Label Pro 栅格系统和页面布局模式**

---

## 栅格系统

### 栅格定义

基于 12 列栅格系统，基础间距为 16px（4px × 4）。

### 断点

| 断点 | 屏幕宽度 | 设备类型 |
|------|---------|---------|
| xs | < 640px | 手机竖屏 |
| sm | ≥ 640px | 手机横屏 |
| md | ≥ 768px | 平板 |
| lg | ≥ 1024px | 桌面 |
| xl | ≥ 1280px | 大屏 |
| 2xl | ≥ 1536px | 超大屏 |

### 栅格容器

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 2rem;
  }
}
```

### 栅格列

```css
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
}
```

### 响应式栅格

```css
/* 移动端: 1 列 */
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 平板端: 2 列 */
@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面端: 3 列 */
@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 页面布局模式

### 1. 单栏布局

适用于登录页、注册页等简单页面。

```
┌─────────────────────────────┐
│                             │
│        顶部导航栏           │
│                             │
├─────────────────────────────┤
│                             │
│                             │
│          主内容区           │
│                             │
│                             │
├─────────────────────────────┤
│          页脚               │
└─────────────────────────────┘
```

### 2. 双栏布局

适用于标注界面、审核界面等复杂页面。

```
┌─────────────────────────────────────────┐
│              顶部导航栏                 │
├──────────┬──────────────────────────────┤
│          │                              │
│ 侧边栏   │          主内容区            │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### 3. 三栏布局

适用于数据仪表板、统计报表等页面。

```
┌─────────────────────────────────────────────────────┐
│                    顶部导航栏                       │
├──────────┬────────────────────┬────────────────────┤
│          │                    │                    │
│ 左侧栏   │      主内容区      │      右侧栏       │
│          │                    │                    │
│          │                    │                    │
└──────────┴────────────────────┴────────────────────┘
```

---

## 常见页面布局

### 登录页布局

```css
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #ECFDF5;
  padding: 1rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 2.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### 首页布局

```css
.home-page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "sidebar main";
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
}

.home-header {
  grid-area: header;
}

.home-sidebar {
  grid-area: sidebar;
}

.home-main {
  grid-area: main;
  padding: 1.5rem;
}
```

### 标注界面布局

```css
.annotate-page {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main right"
    "sidebar main right";
  grid-template-columns: 240px 1fr 320px;
  grid-template-rows: 56px 1fr;
  min-height: 100vh;
}

.annotate-header {
  grid-area: header;
}

.annotate-sidebar {
  grid-area: sidebar;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E7EB;
}

.annotate-main {
  grid-area: main;
  background-color: #F5F7FA;
  padding: 1rem;
}

.annotate-right {
  grid-area: right;
  background-color: #FFFFFF;
  border-left: 1px solid #E5E7EB;
}
```

---

## 间距系统

### 基础间距

| 值 | CSS 变量 | 像素值 | 用途 |
|----|-----------|--------|------|
| 0 | `--spacing-0` | 0px | 无间距 |
| 1 | `--spacing-1` | 4px | 最小间距 |
| 2 | `--spacing-2` | 8px | 小间距 |
| 3 | `--spacing-3` | 12px | 中小间距 |
| 4 | `--spacing-4` | 16px | 中等间距 |
| 5 | `--spacing-5` | 20px | 中大间距 |
| 6 | `--spacing-6` | 24px | 大间距 |
| 8 | `--spacing-8` | 32px | 更大间距 |
| 10 | `--spacing-10` | 40px | 特大间距 |
| 12 | `--spacing-12` | 48px | 超大间距 |

### 间距工具类

```css
.padding-1 { padding: 4px; }
.padding-2 { padding: 8px; }
.padding-3 { padding: 12px; }
.padding-4 { padding: 16px; }
.padding-6 { padding: 24px; }
.padding-8 { padding: 32px; }

.margin-1 { margin: 4px; }
.margin-2 { margin: 8px; }
.margin-3 { margin: 12px; }
.margin-4 { margin: 16px; }
.margin-6 { margin: 24px; }
.margin-8 { margin: 32px; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.gap-8 { gap: 32px; }
```

---

## 容器规范

### 固定宽度容器

```css
.container-sm {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container-md {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container-lg {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container-xl {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### 流体容器

```css
.container-fluid {
  width: 100%;
  padding: 0 1rem;
}
```

---

## 响应式设计策略

### 移动优先

从移动端开始设计，逐步增强到桌面端。

```css
/* 基础样式（移动端） */
.card {
  padding: 1rem;
}

/* 平板端增强 */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

/* 桌面端增强 */
@media (min-width: 1024px) {
  .card {
    padding: 2rem;
  }
}
```

### 隐藏/显示

```css
/* 移动端隐藏 */
.hidden-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hidden-mobile {
    display: block;
  }
}

/* 桌面端隐藏 */
.hidden-desktop {
  display: block;
}

@media (min-width: 1024px) {
  .hidden-desktop {
    display: none;
  }
}
```

---

## 组件布局

### 卡片布局

```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 1rem;
}

.card-body {
  margin-bottom: 1rem;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
  margin-top: 1rem;
}
```

### 导航栏布局

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 1.5rem;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
```

### 侧边栏布局

```css
.sidebar {
  width: 240px;
  height: 100%;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 200ms ease-in-out;
}

.sidebar-item:hover {
  background-color: #F5F7FA;
}

.sidebar-item.active {
  background-color: #ECFDF5;
  color: #059669;
}
```

---

## Z-index 层级管理

```css
:root {
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

---

**文档结束**