# Dashboard Layout Guidelines

This document outlines the design system and layout guidelines for the dashboard interface, ensuring consistency across all dashboard components and pages.

## Design Philosophy

Our dashboard follows modern design principles inspired by industry leaders like Vercel, Linear, GitHub, and Stripe:

- **Minimal and Clean**: Focus on content over decoration
- **Consistent Spacing**: Uniform spacing system throughout
- **Responsive Design**: Works seamlessly across all devices
- **Accessibility**: Proper contrast, focus states, and screen reader support

## Layout Structure

### 1. Dashboard Layout Hierarchy

```
Dashboard Layout
├── Desktop Sidebar (fixed, left)
│   ├── Header (h-14)
│   ├── Navigation
│   └── User Info (dropdown)
├── Mobile Header (sticky, top)
└── Page Content
    ├── Breadcrumb Header (sticky, h-14)
    └── Content Area (p-6)
```

### 2. Key Measurements

- **Header Heights**: `h-14` (56px) - consistent across all headers
- **Content Padding**: `p-6` (24px) - standard content spacing
- **Sidebar Width**: `w-64` (256px) - fixed desktop sidebar
- **Border Radius**: `rounded-md` (6px) - standard component rounding
- **Container Max Width**: `max-w-7xl` (1280px) - content container limit

## Spacing System

### Standard Spacing Scale
- `gap-1` (4px) - Tight spacing within components
- `gap-2` (8px) - Close related elements
- `gap-3` (12px) - Default component spacing
- `gap-4` (16px) - Section spacing
- `gap-6` (24px) - Page section spacing
- `space-y-6` (24px) - Vertical rhythm for page content

### Layout Spacing Rules
1. **Page Content**: Always use `p-6` for consistent padding
2. **Card Spacing**: Use `space-y-6` between cards
3. **Component Groups**: Use `gap-4` between related components
4. **Form Elements**: Use `space-y-2` for form field groups

## Component Guidelines

### 1. DashboardPageContainer

**Purpose**: Wrapper for all dashboard pages providing consistent layout and breadcrumbs.

**Usage**:
```tsx
<DashboardPageContainer breadcrumbItems={breadcrumbItems}>
  {/* Page content */}
</DashboardPageContainer>
```

**Features**:
- Sticky breadcrumb header (`h-14`)
- Backdrop blur effect for modern feel
- Consistent content padding (`p-6`)
- Automatic spacing (`space-y-6`)

### 2. Sidebar Design

**Desktop Sidebar**:
- Fixed positioning (`fixed inset-y-0`)
- Width: `w-64` (256px)
- Header height: `h-14` to match breadcrumbs
- Border: `border-r border-border`

**Mobile Header**:
- Sticky positioning (`sticky top-0`)
- Height: `h-14` to match desktop sidebar header
- Backdrop blur for modern effect
- Minimal content: hamburger, title, theme toggle, sign out

### 3. User Interface Patterns

**Profile Dropdown**:
- Trigger: Full-width button with user info + dropdown icon
- Content: Home link + separator + sign out (red text)
- Alignment: `align="start"` for natural feel

**Navigation Items**:
- Height: `h-10` for main items, `h-8` for sub-items
- Padding: `px-3` for consistent touch targets
- Active state: `bg-secondary` with appropriate text color
- Hover state: `hover:bg-muted/50` for subtle feedback

## Color and Visual Design

### Border Strategy
- **Subtle Borders**: `border-border/50` for soft separation
- **Standard Borders**: `border-border` for clear definition
- **Focus Borders**: `border-ring` for interactive elements

### Background Layers
- **Base**: `bg-background` - main page background
- **Elevated**: `bg-card` - card and panel backgrounds
- **Interactive**: `bg-muted/50` - hover states
- **Glass Effect**: `bg-background/95 backdrop-blur` - sticky headers

### Typography Hierarchy
- **Page Titles**: Not used (content-focused approach)
- **Section Titles**: `text-lg font-semibold` for card headers
- **Body Text**: `text-sm` for most content
- **Meta Text**: `text-xs text-muted-foreground` for secondary info

## Responsive Behavior

### Breakpoints
- **Mobile**: `< lg` (< 1024px) - Mobile header + hamburger sidebar
- **Desktop**: `lg+` (≥ 1024px) - Fixed sidebar + main content

### Mobile Adaptations
1. **Hide Profile Avatar**: Mobile header shows only essential actions
2. **Compact Buttons**: Icon-only buttons with screen reader labels
3. **Touch Targets**: Minimum 44px height for interactive elements
4. **Readable Text**: Never below 14px font size

## Implementation Rules

### 1. Page Structure
Every dashboard page must:
```tsx
// ✅ Correct structure
<DashboardPageContainer breadcrumbItems={items}>
  <div className="space-y-6">
    {/* Page content */}
  </div>
</DashboardPageContainer>

// ❌ Avoid custom wrappers
<div className="custom-wrapper">
  <Breadcrumb items={items} />
  {/* content */}
</div>
```

### 2. Spacing Consistency
```tsx
// ✅ Use standard spacing
<div className="space-y-6">        // Page sections
<div className="gap-4">           // Component groups  
<div className="p-6">             // Content padding

// ❌ Avoid custom spacing
<div className="space-y-5">       // Non-standard spacing
<div className="p-7">             // Custom padding
```

### 3. Component Heights
```tsx
// ✅ Standard heights
<div className="h-14">            // Headers
<Button className="h-10">         // Main nav items
<Button className="h-8">          // Sub nav items

// ❌ Custom heights
<div className="h-12">            // Non-standard header
<Button className="h-11">         // Custom button height
```

## Accessibility Requirements

### 1. Focus Management
- All interactive elements must have visible focus rings
- Tab order should be logical and predictable
- Skip links for keyboard navigation

### 2. Screen Reader Support
- Icon-only buttons must have `sr-only` labels
- Dropdown menus need proper ARIA attributes
- Page structure should use semantic HTML

### 3. Color Contrast
- Text must meet WCAG AA standards (4.5:1 ratio)
- Interactive elements need sufficient contrast
- Focus indicators must be clearly visible

## Common Patterns

### 1. Action Buttons
```tsx
// Primary action - top right of content area
<div className="flex justify-end mb-6">
  <Button>Primary Action</Button>
</div>

// Secondary actions - within cards
<div className="flex gap-2">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</div>
```

### 2. Data Tables
```tsx
// Standard table with search and actions
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>Table Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search..." />
        <Button>Action</Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {/* Table content */}
  </CardContent>
</Card>
```

### 3. Form Layouts
```tsx
// Two-column form layout
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label>Field Label</Label>
    <Input />
  </div>
</div>
```

## Performance Considerations

### 1. Component Optimization
- Use `React.memo` for static components
- Lazy load heavy components
- Minimize re-renders with proper key props

### 2. CSS Performance
- Leverage Tailwind's utility classes
- Avoid custom CSS when possible
- Use CSS Grid/Flexbox for layouts

### 3. Bundle Size
- Tree-shake unused components
- Use dynamic imports for large features
- Optimize images and icons

## Future Considerations

### 1. Dark Mode
- All components support automatic dark mode
- Use CSS variables for theming
- Test in both light and dark modes

### 2. Internationalization
- Design for variable text lengths
- Support RTL languages
- Use semantic spacing (not directional)

### 3. Animation
- Use subtle animations for state changes
- Respect `prefers-reduced-motion`
- Keep animations under 300ms

---

**Note**: These guidelines should be followed for all new dashboard components and pages. Any deviations should be documented and approved through the design review process.