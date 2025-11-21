# Dashboard Documentation

## Overview

The ProprScout dashboard provides users with a comprehensive overview of their property analysis activity, usage statistics, and access to key features. The dashboard has been designed with a premium, unified design system that matches the landing page.

## Dashboard Layout

### Header Section
- **Logo**: Clickable ProprScout logo with green gradient background (`bg-gradient-to-r from-primary-500 to-primary-600`) - consistent green branding throughout
- **Navigation**: Returns to landing page when clicked
- **Credits Display**: Clickable button showing current credit balance in header (47 Credits)
  - Opens comprehensive "Credits & Usage" modal
  - Shows current balance, remaining actions, credit costs, and free vs premium comparison
  - Modal includes upgrade CTA that scrolls to upgrade section
- **Notifications**: Fully functional bell icon with notification count badge
  - Opens dropdown menu with clickable notifications
  - Each notification has type-based icons (success, warning, info)
  - Clicking notification marks as read and navigates to relevant section
  - "Mark all read" functionality
  - Color-coded unread indicators
- **User Profile**: User initials, name, plan type, and settings icon

### Main Content

#### 1. Welcome Section
- Personalized welcome message: "Welcome back, [Name]!"
- Subtitle: "Here's your analysis overview and recent activity."

#### 2. Key Metrics & Activity Chart (Unified Section)
A single card displaying:
- **Metrics Row** (3 columns):
  - **Total Analyses**: Large number (127) with icon and color-coded "+23 this month" indicator (green when positive, red when negative)
  - **Success Rate**: Percentage (98.2%) with "↑ 2.1% from last month" trend in green
  - **This Month**: Monthly count (23) with "analyses completed" label
  
- **7-Day Activity Chart**:
  - Bar chart visualization showing daily analysis activity
  - Interactive bars with hover effects showing green gradient overlay
  - Day labels (Mon-Sun) below each bar
  - Gradient-filled bars with primary brand colors
  - Premium empty state when no activity data (shows "No Activity Yet" with green icon and messaging)

#### 3. Premium Upgrade Section
A comprehensive upgrade card with premium styling:
- **Current Plan Banner**: Yellow gradient banner at the top showing:
  - "Current Plan" label in uppercase amber text
  - Free Tier status: "15 Credits" / "3 analyses per month"
  - Full width matching trust indicators line below
- **Left Side**: Title, Benefits & Trust Indicators
  - **Heading**: "Unlock Premium Features" with green gradient star icon
  - **Subtitle**: "Upgrade for unlimited access and premium features."
  - **Premium Benefits** (4 features with green gradient icons):
    - Unlimited Analyses (No credit limits)
    - Team Collaboration (Share with your team)
    - API Access (Integrate with your tools)
    - Advanced Analytics (Deep insights & reporting)
  - **Trust Indicators** (3 key value propositions):
    - 24/7 Priority Support (with Zap icon)
    - Enterprise Security (with Shield icon)
    - Custom Integrations (with Globe icon)
  - Proper spacing hierarchy between sections
  
- **Right Side**: Premium CTA Card
  - "Best Value" badge with sparkle icon
  - Pricing in euros: "€29/month" or "€290/year (save 17%)"
  - Premium upgrade button with gradient animation effect
  - Guarantee text: "14-day guarantee • Cancel anytime"
  - Widened card width (lg:w-80) for better text layout

#### 4. My Templates Section
- Displays saved analysis templates
- Grid layout (3 columns on desktop, responsive)
- Each template shows:
  - Name and description
  - Credit cost
  - Usage count
- Hover effects with premium styling

#### 5. Recent Analyses Section
- Expandable analysis history list
- Each analysis item:
  - **Status Indicator**: Primary-colored dot with ping animation for completed status
  - **Property Information**: Address, type, date, value, ROI
  - **Priority Badge**: High/Medium/Low with color coding
  - **Action Buttons**: Download and Settings icons
  - **Expandable Details**: Click to view property details:
    - Bedrooms, Bathrooms, Square Feet, Year Built
    - Neighborhood, Market Trend
- Click any row to expand/collapse detailed information
- Smooth animations and transitions

### Floating Action Button (FAB)
- **Position**: Fixed at center-right of viewport, vertically centered (`top-1/2 -translate-y-1/2`)
- **Main Button**: Green gradient circle (`bg-gradient-to-r from-primary-500 to-primary-600`) with white "+" icon
- **Quick Actions Menu** (appears on click above main button):
  1. **Analyze Property Listing** (ScanSearch icon) - Navigate to URL analysis - with hover tooltip
  2. **Search Location from Photo** (Navigation2 icon) - Navigate to location search - with hover tooltip
  3. **View Recent Analyses** (FileText icon) - Smooth scroll to recent analyses section - with hover tooltip
- **Sub-menu Styling**: Premium light green background (`bg-primary-50`) with darker green border (`border-2 border-primary-400`) and hover effects
- Menu closes automatically after selection
- Button rotates 45° when open to indicate state
- All sub-menu buttons have dark tooltips on hover showing action descriptions

### Bottom Status Bar
- Fixed at bottom of page
- Light green gradient background (`bg-gradient-to-r from-primary-50/80 via-primary-50 to-primary-50/80`)
- Compact sizing with proper padding (`py-2.5`)
- Displays:
  - System status: "Ready to Analyze" with pulsing green dot (`bg-primary-500 animate-pulse`)
  - Success rate: "98.2% Success Rate" with green checkmark icon (`text-primary-600`)
  - Monthly analyses: "23 analyses this month" with green activity icon (`text-primary-600`)
  - Last analysis: "Last analysis: 2 minutes ago" with green dot
- Proper alignment with main content boundaries (`px-4 sm:px-6 lg:px-8`)
- Green branding throughout (icons and indicators use primary-600/primary-500)

## Design System

### Colors & Gradients
- **Primary Gradient**: `bg-gradient-to-r from-primary-500 to-primary-600`
- **Hover Gradient**: `hover:from-primary-600 hover:to-primary-700`
- **Icon Backgrounds**: Gradient with glow effects and rings
- **Cards**: White with backdrop blur (`bg-white/80 backdrop-blur-sm`)

### Typography
- **Headings**: `font-heading` class for consistent branding
- **Font Sizes**: Responsive from `text-sm` to `text-3xl`
- **Font Weights**: `font-bold` for headings, `font-semibold` for emphasis

### Icons
- **Consistent Icons**:
  - `ScanSearch` for URL Analysis
  - `Navigation2` for Location Search
  - `BarChart3` for Total Analyses
  - `CheckCircle` for Success Rate
  - `Sparkles` for Credits
- **Icon Styling**: All primary icons use gradient backgrounds with glow effects, rings, and hover animations

### Button Standards
- **Height**: Consistent `py-3` padding
- **Shape**: `rounded-lg` for all buttons
- **Text Size**: `text-base` for primary buttons
- **Gradient**: All primary buttons use `bg-gradient-to-r from-primary-500 to-primary-600`
- **Shadows**: `shadow-md hover:shadow-lg` for depth

### Cards
- **Background**: `bg-white/80 backdrop-blur-sm`
- **Borders**: `border border-white/20`
- **Shadows**: `shadow-xl` with `hover:shadow-2xl`
- **Corners**: `rounded-2xl` for premium feel
- **Hover Effects**: Scale and shadow transitions

## State Management

### React State
- `showLandingPage`: Controls landing page vs dashboard view
- `dashboardView`: 'overview', 'url-analysis', 'location-search'
- `expandedAnalysis`: Tracks which analysis item is expanded
- `fabMenuOpen`: Controls floating action button menu state

### Mock Data
- `userCredits`: 47 (displayed in header)
- `totalAnalyses`: 127
- `monthlyAnalyses`: 23 (color-coded: green when ≥0, red when <0)
- `successRate`: 98.2
- `analysisHistory`: Array of analysis objects with details (property values in euros: €1.2M, €850K, etc.)
- `templates`: Array of saved templates
- `recentActivity`: Array of recent activity items (removed from UI but data exists)

## User Interactions

### Navigation
- Click logo to return to landing page
- Click FAB button to open quick actions menu
- Click analysis items to expand/collapse details
- Smooth scrolling to sections when needed

### Actions
- **Start Analysis**: Via FAB menu or analysis history actions
- **Download Results**: Click download icon on analysis item
- **Upgrade**: Click "Upgrade to Premium" button in upgrade section
- **View Details**: Click any analysis row to expand

## Responsive Design

### Breakpoints
- **Mobile**: Single column layout, hidden credits info
- **Tablet (md)**: 2-3 column grids where appropriate
- **Desktop (lg)**: Full multi-column layouts

### Mobile Considerations
- Credits display hidden on small screens
- Grid layouts collapse to single column
- Touch-friendly button sizes
- Expandable sections optimized for mobile interaction

## Performance

### Optimizations
- Lazy loading of chart data
- Efficient state updates
- Smooth animations with CSS transitions
- Backdrop blur effects for premium feel
- Optimized icon rendering

## Recent Updates

### Consolidated Design (Latest)
- ✅ Removed duplicate Quick Action cards (replaced by FAB)
- ✅ Removed redundant My Activity section
- ✅ Unified metrics into chart section for better context
- ✅ Removed duplicate Credits card (already in header)
- ✅ Combined Upgrade Plan and Premium Features into one smart section
- ✅ Enhanced analysis history with expandable details
- ✅ Fixed FAB positioning to center-right
- ✅ Standardized all icons to match landing page design system
- ✅ Consistent gradient buttons throughout
- ✅ Premium icon presentation with glow effects

### Navigation Improvements
- Logo clickable to return to landing page
- FAB provides quick access to main actions
- Smooth scrolling for better UX

### Visual Hierarchy
- Metrics first (in chart section)
- Upgrade section prominent but not intrusive
- Templates and history follow logically

## Code Structure

### Main Component
`src/App.jsx` - Dashboard component with:
- Header section
- Welcome message
- Key metrics and chart (unified)
- Upgrade section
- Templates section
- Recent analyses section
- Floating action button
- Bottom status bar

### Key Features
- State management for expandable sections
- Click handlers for navigation
- Responsive grid layouts
- Premium styling throughout
- Consistent design system implementation

---

**Last Updated**: November 2, 2024 - Added functional notifications system, clickable credits display with comprehensive modal, free tier vs premium comparison, current plan banner in upgrade section, and enhanced user guidance throughout the dashboard.

