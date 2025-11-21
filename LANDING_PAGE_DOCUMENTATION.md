# LandingPage Component Documentation

## Overview

The `LandingPage` component is the main marketing/landing page for ProprScout, featuring a modern, premium design with animated backgrounds, interactive elements, and comprehensive content sections.

## Component Location

`src/components/LandingPage.jsx`

## Features

### 1. Animated Background
- **Mouse-tracking effects**: Background elements respond to mouse movement
- **Floating particles**: 12 animated particles with varying delays
- **Geometric patterns**: Rotating borders and shapes
- **Gradient overlays**: Dynamic color transitions

### 2. Header & Navigation
- **Sticky header**: Transforms on scroll (transparent → white with blur)
- **Responsive navigation**: Desktop and mobile menu support
- **Logo**: ProprScout logo with gradient background (green gradient)
- **CTAs**: "Free Sign Up" button with UserPlus icon
- **Links**: Features, Case Studies navigation

### 3. Hero Section
- **Trust badge**: "Trusted by 500+ Real Estate Professionals"
- **Main heading**: "AI Property Intelligence Unlocked" with gradient text effect
- **Subtitle**: "Convert property listings into actionable market intelligence using enterprise-grade AI"
- **CTA buttons**:
  - "Free Sign Up" (green gradient button)
  - "Book Demo" (white button linking to Calendly)
- **Business metrics cards**: 30s, 95%, 10+ stats
- **Product demo video section**: Interactive video player placeholder

### 4. Enterprise Solutions Section
- **Heading**: "For Enterprise Solutions"
- **Description**: Platform capabilities and accuracy
- **CTA**: "Book Demo" button (green gradient) linking to Calendly
- **Credibility indicators**: 99.9% Uptime, SOC 2 Compliant, 500+ Clients

### 5. Features Section
- **Heading**: "Transforming data into property intelligence"
- **Three feature cards**:
  1. **Property Analysis** (ScanSearch icon)
     - Premium icon presentation with glow effects
     - "Turn property listings into market intelligence"
  2. **Location Intelligence** (Navigation2 icon)
     - "Precision location targeting"
  3. **Market Insights** (Target icon)
     - "Property targeting"
- **Premium icon styling**: Glow effects, gradients, ring borders, hover animations

### 6. Testimonials Section
- Three testimonials from industry professionals
- Star ratings (5 stars each)
- Avatar circles with initials

### 7. Case Studies Section (Interactive Carousel)
- **Carousel functionality**: Toggle arrows (ChevronLeft/ChevronRight)
- **Dot indicators**: Clickable dots showing current insight
- **Multiple insights**: 3 case studies that can be navigated
  1. Investment Success
  2. Market Insights
  3. Location Intelligence
- **Navigation**: Previous/Next buttons with hover effects

### 8. Blog Section
- **Heading**: "Explore our blog"
- **Subtitle**: "Hear the latest from the ProprScout community"
- **Three blog cards**: Standardized layout with equal heights
- **CTA alignment**: "Read more" buttons aligned at bottom using flexbox

### 9. Bottom CTA Section
- **Background**: Isometric green houses image with frosting overlay
- **Gradient overlay**: Matches button gradient colors (primary-500 to primary-600)
- **Heading**: "Transforming data into property intelligence."
- **Description**: ProprScout value proposition
- **CTA**: "Try ProprScout" button (white with green text)

### 10. Footer
- **Four-column layout**:
  1. ProprScout branding (logo with gradient)
  2. Contact links (Privacy Policy, Terms & Conditions, Acceptable Use)
  3. Newsletter signup (email input + Subscribe button)
  4. Copyright section
- **Copyright**: "Copyright © 2024 ProprScout Intelligence a ProprHome © product."
- **Positioning**: Copyright at very bottom with subtle styling

## State Management

```javascript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
const [currentCaseStudy, setCurrentCaseStudy] = useState(0);
```

## Design System Standards

### Colors
- **Primary Gradient**: `from-primary-500 to-primary-600` (used on all green buttons and logos)
- **Hover State**: `hover:from-primary-600 hover:to-primary-700`
- **Text Colors**: Gray-900 (headings), Gray-600 (body), Gray-500 (subtle)

### Buttons
- **Standard Height**: `py-3` (12px vertical padding)
- **Standard Shape**: `rounded-lg` (8px border radius)
- **Green Buttons**: Gradient from primary-500 to primary-600
- **White Buttons**: White background with gray text/border

### Typography
- **Headings**: `font-heading` class, bold weights
- **Sizes**: Responsive (text-3xl to text-6xl)

### Icons
- **Premium Presentation**: Icons with glow effects, gradients, ring borders
- **Standard Size**: `w-4 h-4` for buttons, `w-7 h-7` for feature cards

## Interactive Elements

### 1. Case Study Carousel
- **Left Arrow**: Previous insight (wraps to end)
- **Right Arrow**: Next insight (wraps to start)
- **Dot Indicators**: Direct navigation to specific insight
- **State**: `currentCaseStudy` tracks active index

### 2. Mobile Menu
- **Toggle Button**: Hamburger/Close icon
- **Dropdown Menu**: Full-width mobile navigation
- **State**: `mobileMenuOpen` controls visibility

### 3. Scroll Effects
- **Header**: Transforms on scroll (transparent → white)
- **State**: `scrolled` tracks scroll position (>50px)

### 4. Mouse Tracking
- **Background Animation**: Elements follow mouse movement
- **State**: `mousePosition` tracks cursor coordinates

## External Links

- **Calendly Integration**: All "Book Demo" buttons link to `https://calendly.com/johnmccoy/30min`
- **Opens in new tab**: `target="_blank"` with security attributes

## Assets

### Images
- **Background Image**: `/green-houses-isometric.png` (isometric green houses pattern)
- **Button Background**: `/clip-path-group.png` (used on "Try ProprScout" button)

## Responsive Design

### Breakpoints
- **Mobile**: Default (single column)
- **Tablet**: `md:` prefix (2 columns)
- **Desktop**: `lg:` prefix (3 columns)

### Mobile Features
- Collapsible navigation menu
- Stacked CTA buttons
- Full-width cards
- Responsive typography

## Accessibility

- **ARIA Labels**: Navigation arrows and dot indicators
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus States**: Visible focus indicators on interactive elements
- **Semantic HTML**: Proper heading hierarchy and semantic elements

## Performance Considerations

- **Animations**: CSS transitions for smooth performance
- **Backdrop Blur**: Used sparingly for glass-morphism effects
- **Image Optimization**: Background images use `cover` sizing
- **Lazy Loading**: Components rendered on demand

## Customization Guide

### Adding New Case Study
Add to `caseStudies` array:
```javascript
{
  tag: "Category Name",
  title: "Case Study Title",
  description: "Case study description text"
}
```

### Updating Brand Colors
All green buttons use:
```javascript
className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
```

### Modifying Background Image
Update the background image path in the bottom CTA section:
```javascript
backgroundImage: 'url(/green-houses-isometric.png)'
```

## Recent Updates

### Latest Changes
- ✅ Standardized all button heights (`py-3`)
- ✅ Applied gradient to all green buttons and logos
- ✅ Added case study carousel with navigation arrows
- ✅ Standardized blog card layout with flexbox
- ✅ Updated copy throughout (Enterprise Solutions, blog, etc.)
- ✅ Applied gradient overlay to background section to match button colors
- ✅ Added premium icon styling with glow effects
- ✅ Updated copyright positioning and styling

## Component Props

```typescript
interface LandingPageProps {
  onEnterApp: () => void; // Callback for "Free Sign Up" and "Try ProprScout" buttons
}
```

## Dependencies

- **React**: `useState`, `useEffect` hooks
- **Lucide React**: Icons (Play, Menu, X, Sparkles, ArrowRight, Users, Shield, CheckCircle, Calendar, UserPlus, ScanSearch, Navigation2, Target, ChevronLeft, ChevronRight)
- **Tailwind CSS**: All styling and responsive utilities

---

**Last Updated**: October 30, 2024
**Version**: 1.0.0

