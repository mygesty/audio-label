# 交互规范

> **Audio Label Pro 用户交互模式和反馈机制**

---

## 按钮交互

### 按钮状态

| 状态 | 描述 | CSS 类 |
|------|------|--------|
| 默认 | 普通状态 | `.btn` |
| 悬停 | 鼠标悬停 | `.btn:hover` |
| 点击 | 鼠标按下 | `.btn:active` |
| 禁用 | 不可点击 | `.btn:disabled` |
| 加载 | 处理中 | `.btn.loading` |

### 过渡效果

```css
.btn {
  transition: all 200ms ease-in-out;
}
```

### 按钮样式

```css
/* Primary Button */
.btn-primary {
  background-color: #059669;
  color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  background-color: #047857;
}

.btn-primary:active {
  background-color: #047857;
  transform: scale(0.98);
}

/* Secondary Button */
.btn-secondary {
  background-color: #10B981;
  color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-secondary:hover {
  background-color: #059669;
}

/* CTA Button */
.btn-cta {
  background-color: #F97316;
  color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-cta:hover {
  background-color: #EA580C;
}

/* Disabled Button */
.btn:disabled {
  background-color: #D1D5DB;
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

## 表单交互

### 输入框状态

| 状态 | 描述 | 边框色 |
|------|------|--------|
| 默认 | 普通状态 | `#D1D5DB` |
| 聚焦 | 输入焦点 | `#10B981` |
| 错误 | 验证失败 | `#EF4444` |
| 成功 | 验证成功 | `#10B981` |

### 输入框样式

```css
.input {
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  padding: 0.75rem;
  transition: border-color 200ms ease-in-out;
}

.input:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input.error {
  border-color: #EF4444;
}

.input.success {
  border-color: #10B981;
}
```

### 表单验证

- **实时验证**: 用户输入时实时验证
- **失焦验证**: 失去焦点时验证
- **提交验证**: 提交时验证所有字段

### 错误提示

```css
.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

---

## 反馈机制

### Toast 提示

| 类型 | 颜色 | 图标 |
|------|------|------|
| 成功 | `#10B981` | ✅ |
| 错误 | `#EF4444` | ❌ |
| 警告 | `#F59E0B` | ⚠️ |
| 信息 | `#3B82F6` | ℹ️ |

### Toast 样式

```css
.toast {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background-color: #FFFFFF;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 200ms ease-in-out;
}

.toast.success {
  border-left: 4px solid #10B981;
}

.toast.error {
  border-left: 4px solid #EF4444;
}

.toast.warning {
  border-left: 4px solid #F59E0B;
}

.toast.info {
  border-left: 4px solid #3B82F6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Modal 对话框

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1040;
  animation: fadeIn 200ms ease-in-out;
}

.modal {
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: slideUp 200ms ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 加载状态

### Skeleton 骨架屏

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.375rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Loading Spinner

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 动效规范

### 过渡时间

| 类型 | 时间 | 用途 |
|------|------|------|
| 快速 | 150ms | 简单的 hover 效果 |
| 正常 | 200ms | 标准过渡效果 |
| 慢速 | 300ms | 复杂的动画 |

### 缓动函数

```css
transition-timing-function: ease-in-out;
```

### 常用动效

```css
/* Hover 效果 */
.hover-effect {
  transition: transform 200ms ease-in-out;
}

.hover-effect:hover {
  transform: scale(1.05);
}

/* Fade 效果 */
.fade-in {
  animation: fadeIn 200ms ease-in-out;
}

/* Slide 效果 */
.slide-up {
  animation: slideUp 200ms ease-in-out;
}
```

---

## 手势交互（移动端）

### 滑动

- 左滑删除
- 右滑编辑

### 双击

- 双击收藏
- 双击点赞

### 长按

- 长按显示上下文菜单

---

## 键盘导航

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Space | 播放/暂停 |
| Esc | 停止/关闭 |
| Enter | 确认/提交 |
| Tab | 切换焦点 |
| Shift+Tab | 反向切换焦点 |
| Ctrl+K | 打开搜索 |
| Ctrl+S | 保存 |

### 焦点管理

```css
:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}
```

---

## 工具提示

```css
.tooltip {
  position: absolute;
  background-color: #064E3B;
  color: #FFFFFF;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1070;
  animation: fadeIn 150ms ease-in-out;
}

.tooltip::before {
  content: '';
  position: absolute;
  border: 6px solid transparent;
}
```

---

## 拖拽交互

### 拖拽样式

```css
.draggable {
  cursor: move;
  user-select: none;
}

.dragging {
  opacity: 0.5;
}

.drag-over {
  background-color: #ECFDF5;
  border: 2px dashed #10B981;
}
```

---

## 滚动交互

### 自定义滚动条

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
```

---

## 触摸反馈（移动端）

```css
/* iOS 触摸反馈 */
-webkit-tap-highlight-color: transparent;

/* 触摸时缩放 */
.touch-feedback:active {
  transform: scale(0.95);
  transition: transform 100ms ease-in-out;
}
```

---

**文档结束**