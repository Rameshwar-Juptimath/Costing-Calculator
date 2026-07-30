---
name: Precision Engineering Interface
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  data-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  cell-padding-x: 12px
  cell-padding-y: 8px
---

## Brand & Style

This design system is engineered for high-stakes financial decision-making within the manufacturing sector. The brand personality is clinical, authoritative, and hyper-efficient, prioritizing information density over decorative white space. 

The aesthetic merges the industrial utility of a Bloomberg Terminal with the refined clarity of modern fintech dashboards. It utilizes a **Modern Corporate** style with **Minimalist** and **Data-Dense** influences. The emotional response should be one of total control, accuracy, and professional reliability. Visual hierarchy is dictated by data importance rather than marketing flair, ensuring that complex costing trees and bill-of-materials (BOM) are legible at a glance.

## Colors

The palette is strictly functional, designed to minimize eye strain during prolonged analytical sessions while highlighting critical financial data.

- **Primary (Indigo #6366F1):** Reserved exclusively for primary calls to action, active states, and final financial totals.
- **Surface & Backgrounds:** Use Zinc and Slate scales. The main application background is `Slate-50` (#F8FAFC), while primary content panels are pure White (#FFFFFF) to provide maximum contrast.
- **Borders & Dividers:** Use `Slate-200` (#E2E8F0) for standard separators and `Slate-300` (#CBD5E1) for interactive element strokes.
- **Functional Colors:** Use standard semantic colors for status—Success (Emerald), Warning (Amber), and Danger (Rose)—but desaturate them slightly to fit the professional slate-toned environment.

## Typography

This design system employs a dual-font strategy to distinguish between UI navigation and quantitative analysis.

- **Inter:** Used for all labels, navigation elements, and instructional text. It provides high legibility at small sizes. Use `font-feature-settings: "cv05", "cv08", "cv11"` to enhance character distinction.
- **JetBrains Mono:** Mandatory for all numerical data, currency symbols, and calculation outputs. The monospaced nature ensures that decimals align perfectly in vertical columns, which is critical for costing tables.

**Scaling Note:** On mobile devices, maintain high density by only slightly reducing font sizes. The priority remains showing as much data as possible without horizontal scrolling.

## Layout & Spacing

The layout utilizes a **Fluid Grid** with fixed-width sidebars. The primary workspace is a multi-pane dashboard that can reflow based on the number of active panels.

- **Spacing Rhythm:** Based on a strict 4px grid. 
- **Density:** High. Standard vertical padding for list items and table rows is 8px. 
- **Grid:** 12-column system for desktop, collapsing to a single column on mobile. 
- **Sidebars:** Left-hand navigation is 240px wide. Right-hand "Detail/Inspector" panes are 320px wide.
- **Sticky Elements:** Calculation footers and table headers must remain sticky to provide constant context when scrolling through long BOM lists.

## Elevation & Depth

To maintain a "technical tool" feel, this design system avoids heavy shadows and floating elements. Depth is communicated through **Low-contrast outlines** and **Tonal Layers**.

- **Level 0 (Canvas):** `Slate-50` background.
- **Level 1 (Panels):** White surface with a 1px solid border in `Slate-200`. No shadow.
- **Level 2 (Overlays/Dropdowns):** White surface with a 1px `Slate-300` border and a tight, low-opacity shadow (0px 4px 6px -1px rgba(15, 23, 42, 0.1)).
- **Active States:** Elements being edited or focused receive a 1px Indigo border and a soft 2px Indigo outer glow (box-shadow).

## Shapes

The shape language is "Soft" yet precise. 

- **Base Radius (4px):** Applied to buttons, input fields, and small UI components.
- **Panel Radius (8px):** Applied to large card containers and main workspace areas.
- **Interactive Elements:** Checkboxes and radio buttons use the base 4px radius, staying away from fully circular radios to maintain the "engineered" aesthetic.

## Components

### Buttons
- **Primary:** Solid Indigo background, white text. High contrast.
- **Secondary/Ghost:** `Slate-100` background with `Slate-900` text. 
- **Size:** Compact (32px height) for toolbar actions; Standard (40px height) for main forms.

### Input Fields
- **Design:** Rectangular with a 1px `Slate-300` border. Labels are always top-aligned in `label-caps` style.
- **Data Input:** Currency and unit fields must use `JetBrains Mono`. Prefix (e.g., $) and Suffix (e.g., USD) are anchored in `Slate-400`.

### Segmented Controls
- Used for toggling views (e.g., "Monthly" vs "Annual").
- Enclosed in a `Slate-100` track with a white, elevated "active" segment.

### Data Tables
- The core of the system. High density. 
- **Header:** `Slate-100` background, uppercase labels.
- **Rows:** Alternate "zebra striping" is discouraged; use subtle 1px bottom borders instead. 
- **Alignment:** Numerical columns must be right-aligned using JetBrains Mono for decimal precision.

### Alert Banners
- Non-intrusive, inline banners.
- Use a thick 4px left-border of the semantic color (e.g., Amber for warning) rather than a full-color background to keep the interface clean.

### Sticky Footer
- A persistent calculation bar at the bottom of the screen that updates in real-time. 
- Uses a `Slate-900` background with white `JetBrains Mono` text for maximum contrast on total costing values.