# Mira Ops Design System

A unified design system for Triage and Assignment cards that provides consistent accent styling, interactions, and content layouts across the application.

## Overview

The Mira Ops design system implements:
- **Shared accent system** driven by priority/risk levels
- **Consistent left rail** (4px) with matching hover outlines  
- **Unified badges, progress states, and content layouts**
- **Accessibility-first** with proper contrast and reduced motion support

## Core Principles

1. **Single source of truth** for severity colors (low→green, medium→yellow, high→orange, critical→red)
2. **Left rail accent** + **hover outline** always match the priority/risk level
3. **No decorative borders** - only the functional 4px left rail
4. **Content over chrome** - clean layouts without visual noise

## CSS Variables

### Accent System
```css
--accent-priority-low: #22C55E        /* Green */
--accent-priority-medium: #EAB308     /* Yellow */
--accent-priority-high: #F97316       /* Orange */
--accent-priority-critical: #EF4444   /* Red */

/* Risk maps to priority colors */
--accent-risk-Low: var(--accent-priority-low)
--accent-risk-Medium: var(--accent-priority-medium)
--accent-risk-High: var(--accent-priority-high)
--accent-risk-Critical: var(--accent-priority-critical)
```

### Design Tokens
```css
--surface-card: #FFFFFF
--border-default: #E5E7EB
--text-primary: #0F172A
--text-secondary: #6B7280
--progress-base: #EAEFF5
--progress-active: #2563EB
--progress-complete: var(--accent-priority-low)
--progress-idle: #CBD5E1
```

## Components

### MiraCard

Main card component with accent system:

```tsx
import { MiraCard } from "./components/MiraCard";

<MiraCard accentFrom="priority" level="high" className="max-w-md">
  <div className="p-4">
    <!-- Card content -->
  </div>
</MiraCard>
```

**Props:**
- `accentFrom`: "priority" | "risk"
- `level`: "low" | "medium" | "high" | "critical"
- `state`: "default" | "hover" | "focus" | "disabled"

### MiraBadge

Consistent badge styling:

```tsx
import { MiraBadge } from "./components/MiraCard";

<MiraBadge type="priority" level="high">High Priority</MiraBadge>
<MiraBadge type="risk" level="critical">Critical Risk</MiraBadge>
```

### MiraProgress

Progress bar with state-based styling:

```tsx
import { MiraProgress } from "./components/MiraCard";

<MiraProgress value={0} />    <!-- Grey (idle) -->
<MiraProgress value={45} />   <!-- Blue with shimmer (active) -->
<MiraProgress value={100} />  <!-- Green (complete) -->
```

### MiraStepRow

Clean step rows without timeline decoration:

```tsx
import { MiraStepRow } from "./components/MiraCard";

<MiraStepRow
  index={1}
  title="Deploy application"
  description="Rolling deployment to production"
  state="running"
  agent={<MiraBadge type="priority" level="medium">DevOps</MiraBadge>}
/>
```

## Content Templates

### TriageCardContent

Standardized layout for triage items:

```tsx
import { TriageCardContent } from "./components/MiraCard";

<TriageCardContent
  title="Critical security patch"
  risk="critical"
  summary="Deploy CVE patch to production servers"
  agent="SecurityBot-v1.3"
  autonomy="Low"
  confidence={85}
  assignee="Lisa Park"
  provenance={["CVE Database", "Security Scanner"]}
/>
```

### AssignmentCardContent

Standardized layout for assignments:

```tsx
import { AssignmentCardContent } from "./components/MiraCard";

<AssignmentCardContent
  title="Deploy microservice updates"
  description="Update payment processing to v2.1.0"
  priority="high"
  createdBy="Sarah Chen"
  progress={65}
  statusNote="Executing step 3/5..."
/>
```

## Migration Guide

### From AccentCard to MiraCard

**Before:**
```tsx
<AccentCard tone="priority" statusKey="high">
  <!-- content -->
</AccentCard>
```

**After:**
```tsx
<AccentCard tone="mira" statusKey="high" useMiraSystem={true}>
  <!-- content -->
</AccentCard>
<!-- OR -->
<MiraCard accentFrom="priority" level="high">
  <!-- content -->
</MiraCard>
```

### From Custom Styling to Mira Classes

**Before:**
```tsx
<div className="border-l-4 border-orange-500 p-4 bg-white rounded-xl">
  <Badge className="border-orange-500 text-orange-700">High</Badge>
</div>
```

**After:**
```tsx
<MiraCard accentFrom="priority" level="high" className="p-4">
  <MiraBadge type="priority" level="high">High</MiraBadge>
</MiraCard>
```

## Utility Functions

```tsx
import { 
  normalizeMiraLevel,
  getMiraAccentColor,
  createMiraStyle,
  mapPriorityToMira,
  mapRiskToMira 
} from "./lib/mira-design-system";

// Convert existing data
const { accentFrom, level } = mapPriorityToMira("High Priority");
const style = createMiraStyle("priority", "high");
```

## Design Specifications

- **Card radius:** 16px
- **Left rail width:** 4px
- **Content padding:** 16px
- **Content gap:** 8-12px
- **Badge text:** 12px/16px line-height
- **Badge padding:** 8px horizontal
- **Badge radius:** 16px
- **Progress height:** 8px
- **Progress radius:** 8px

## Accessibility

- **Minimum contrast:** 4.5:1 for all text
- **Shimmer animation:** 6s duration, respects `prefers-reduced-motion`
- **Focus indicators:** System focus rings, not card outlines
- **Color independence:** Labels always accompany color coding
- **Keyboard navigation:** Full keyboard support for interactive elements

## Examples

See `/components/MiraExamples.tsx` for complete implementation examples including:
- Triage card with Mira styling
- Assignment card with progress tracking
- Step rows with agent badges
- Progress states (idle, active, complete)
- Badge variations (priority/risk levels)

## Browser Support

- **Modern browsers:** Chrome 88+, Firefox 87+, Safari 14+
- **CSS Custom Properties:** Required
- **CSS Grid/Flexbox:** Required
- **CSS Animations:** Enhanced experience, graceful degradation