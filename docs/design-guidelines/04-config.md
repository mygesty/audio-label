# 技术配置

> **Audio Label Pro 设计 Token 和 CSS 配置**

---

## CSS Variables

### 颜色变量

```css
:root {
  /* Primary - Green */
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

  /* Secondary - Orange */
  --color-secondary-50: #FFF7ED;
  --color-secondary-100: #FFEDD5;
  --color-secondary-200: #FED7AA;
  --color-secondary-300: #FDBA74;
  --color-secondary-400: #FB923C;
  --color-secondary-500: #F97316;
  --color-secondary-600: #EA580C;
  --color-secondary-700: #C2410C;
  --color-secondary-800: #9A3412;
  --color-secondary-900: #7C2D12;

  /* Neutral */
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

### 字体变量

```css
:root {
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

  /* Font Weight */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line Height */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### 间距变量

```css
:root {
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
}
```

### 圆角变量

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}
```

### 阴影变量

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

### 断点变量

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Z-index 变量

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

### 过渡变量

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## 基础样式重置

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: var(--leading-normal);
  color: var(--color-neutral-900);
  background-color: var(--color-neutral-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  list-style: none;
}
```

---

## 组件样式实现

### 按钮

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
}

.btn-primary:active {
  background-color: var(--color-primary-800);
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-neutral-300);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: var(--color-primary-500);
  color: #FFFFFF;
}

.btn-secondary:hover {
  background-color: var(--color-primary-600);
}

.btn-cta {
  background-color: var(--color-secondary-500);
  color: #FFFFFF;
}

.btn-cta:hover {
  background-color: var(--color-secondary-600);
}

.btn-danger {
  background-color: var(--color-error);
  color: #FFFFFF;
}

.btn-danger:hover {
  background-color: #DC2626;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: var(--text-sm);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: var(--text-lg);
}
```

### 输入框

```css
.input {
  width: 100%;
  padding: 0.75rem;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-neutral-900);
  background-color: #FFFFFF;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-normal),
              box-shadow var(--transition-normal);
}

.input::placeholder {
  color: var(--color-neutral-400);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input:disabled {
  background-color: var(--color-neutral-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.input.error {
  border-color: var(--color-error);
}

.input.success {
  border-color: var(--color-success);
}
```

### 卡片

```css
.card {
  background-color: #FFFFFF;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.card-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-neutral-200);
  margin-bottom: 1rem;
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.card-body {
  margin-bottom: 1rem;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-neutral-200);
  margin-top: 1rem;
}
```

### 标签

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.tag-default {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.tag-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.tag-success {
  background-color: #D1FAE5;
  color: var(--color-primary-700);
}

.tag-warning {
  background-color: #FEF3C7;
  color: var(--color-secondary-700);
}

.tag-danger {
  background-color: #FEE2E2;
  color: var(--color-error);
}
```

### 徽章

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.75rem;
  font-weight: var(--font-semibold);
  line-height: 1;
  border-radius: var(--radius-full);
  background-color: var(--color-error);
  color: #FFFFFF;
}
```

---

## 工具类

### Flexbox

```css
.flex {
  display: flex;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.gap-1 { gap: var(--spacing-1); }
.gap-2 { gap: var(--spacing-2); }
.gap-3 { gap: var(--spacing-3); }
.gap-4 { gap: var(--spacing-4); }
.gap-6 { gap: var(--spacing-6); }
.gap-8 { gap: var(--spacing-8); }
```

### 文本

```css
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }

.font-light { font-weight: var(--font-light); }
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }
```

### 间距

```css
.p-1 { padding: var(--spacing-1); }
.p-2 { padding: var(--spacing-2); }
.p-3 { padding: var(--spacing-3); }
.p-4 { padding: var(--spacing-4); }
.p-6 { padding: var(--spacing-6); }
.p-8 { padding: var(--spacing-8); }

.m-1 { margin: var(--spacing-1); }
.m-2 { margin: var(--spacing-2); }
.m-3 { margin: var(--spacing-3); }
.m-4 { margin: var(--spacing-4); }
.m-6 { margin: var(--spacing-6); }
.m-8 { margin: var(--spacing-8); }
```

---

## 响应式查询

```css
@media (min-width: 640px) {
  /* sm */
}

@media (min-width: 768px) {
  /* md */
}

@media (min-width: 1024px) {
  /* lg */
}

@media (min-width: 1280px) {
  /* xl */
}

@media (min-width: 1536px) {
  /* 2xl */
}
```

---

**文档结束**