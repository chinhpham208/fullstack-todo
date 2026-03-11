---
name: ui
description: UI/UX guidelines and patterns for this React todo app
---

## Design System

**Color Palette:**
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Success: `#2ecc71`
- Danger/Error: `#e74c3c`
- Error background: `#fde8e8`
- Text primary: `#333`
- Text secondary: `#666`
- Text muted: `#999`
- Background: `#f0f2f5`
- Card background: `white`

**Border radius:**
- Cards/boxes: `12px` or `16px`
- Inputs/buttons: `8px` or `10px`

**Shadows:**
- Cards: `0 2px 8px rgba(0,0,0,0.06)`
- Modal/auth box: `0 20px 60px rgba(0,0,0,0.2)`

**Font:** `Arial, sans-serif`

---

## Component Patterns

**Inline styles** — this project uses inline style objects, not CSS files:
```jsx
const styles = {
  page: { minHeight: "100vh", ... },
  button: { padding: 14, borderRadius: 8, ... },
}
// Usage:
<div style={styles.page}>
```

**Loading state pattern:**
```jsx
const [loading, setLoading] = useState(false);
// In async function:
setLoading(true);
try { ... } finally { setLoading(false); }
// In JSX:
<button disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
  {loading ? "Loading..." : "Submit"}
</button>
```

**Error state pattern:**
```jsx
const [error, setError] = useState("");
// In catch:
setError(err.response?.data?.error || "Something went wrong!");
// In JSX:
{error && <p style={styles.errorText}>{error}</p>}
```

**Empty state pattern:**
```jsx
{todos.length === 0 && (
  <div style={styles.empty}>
    <p style={{ fontSize: 48 }}>🎉</p>
    <p>No tasks yet! Add your first one.</p>
  </div>
)}
```

---

## UX Rules
- Always show loading state during async operations
- Always show error messages inline (never just console.log)
- Disable buttons while loading to prevent double submit
- Support Enter key on inputs (`onKeyDown={(e) => e.key === "Enter" && handleSubmit()}`)
- Clear error message when user starts a new action (`setError("")`)
- Redirect to `/login` if API returns 401

---

## Responsive Considerations
- Auth pages: `maxWidth: 400`, centered with flexbox
- Home page: `maxWidth: 600`, centered with `margin: "0 auto"`
- Use `boxSizing: "border-box"` and `width: "100%"` on inputs
- Use `whiteSpace: "nowrap"` on buttons that should not wrap

---

## Improving UI — Common Tasks

**Add a new style property to existing component:**
1. Read the component file
2. Add key to the `styles` object at the bottom
3. Apply with `style={styles.newKey}` or inline spread

**Add hover effect (no CSS):**
Use `onMouseEnter`/`onMouseLeave` with local state:
```jsx
const [hovered, setHovered] = useState(false);
<button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{ opacity: hovered ? 0.8 : 1 }}
>
```

**Add animation/transition:**
```jsx
style={{ transition: "all 0.2s" }}
```
