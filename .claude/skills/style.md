---
name: style
description: Restyle or improve UI components in this React app
---

When asked to restyle a component, follow this process:

## 1. Read the file first
Always read the component file before making changes.

## 2. Identify what to change
- Colors → update in `styles` object at bottom of file
- Layout → update flexbox/padding/margin values
- Typography → update fontSize, fontWeight, color
- Spacing → update padding, margin, gap values

## 3. Apply consistently
If changing a color or value used in multiple places, update all occurrences.

## 4. Design tokens (use these values)

| Token | Value |
|-------|-------|
| Primary gradient | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
| Success color | `#2ecc71` |
| Error color | `#e74c3c` |
| Border color | `#ddd` |
| Card shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| Auth shadow | `0 20px 60px rgba(0,0,0,0.2)` |
| Border radius (sm) | `8px` |
| Border radius (md) | `10px` |
| Border radius (lg) | `12px` or `16px` |

## 5. Common improvements

**Make button more prominent:**
```jsx
button: {
  padding: "14px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
}
```

**Make input cleaner:**
```jsx
input: {
  padding: "12px 16px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 15,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
}
```

**Card style:**
```jsx
card: {
  background: "white",
  borderRadius: 12,
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  marginBottom: 12,
}
```

After restyling, run `/build` to ensure no errors, then `/commit` with `style:` prefix.
