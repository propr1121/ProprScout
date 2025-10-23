# ProprScout Design System

## Brand Identity

**Product Name**: ProprScout Intelligence
**Tagline**: Deep property analysis from any listing URL
**Mission**: Empower agents with instant property intelligence

## Color Palette

### Brand Primary - Green
```css
--primary-green-50: #f0fdf4;
--primary-green-100: #d1fae5;
--primary-green-200: #a7f3d0;
--primary-green-300: #6ee7b7;
--primary-green-400: #34d399;
--primary-green-500: #10b981;      /* Main brand color */
--primary-green-600: #059669;      /* Hover states */
--primary-green-700: #047857;
--primary-green-800: #065f46;
--primary-green-900: #064e3b;
--primary-green-950: #022c22;
```

### Secondary Colors
```css
--secondary-blue: #3b82f6;      /* Blue 500 - Information */
--secondary-purple: #8b5cf6;    /* Violet 500 - Premium features */
--secondary-amber: #f59e0b;     /* Amber 500 - Warnings */
--secondary-rose: #f43f5e;      /* Rose 500 - Alerts */
--secondary-teal: #18947b;      /* Teal - Complementary */
--secondary-turquoise: #19eb9b; /* Turquoise - Accent */
```

### Extended Color Palette
```css
/* Teal Family */
--teal-100: #d1fae5;
--teal-300: #23c9c7;
--teal-default: #18947b;
--teal-800: #114440;
--teal-950: #072c27;

/* Yellow Family */
--yellow-400: #ffb600;
--yellow-500: #ff9900;
--yellow-600: #e29000;
--yellow-950: #a82100;

/* Turquoise Family */
--turquoise-400: #19eb9b;
--turquoise-default: #0004C8;
--turquoise-900: #005554;
--turquoise-950: #003234;

/* Shark (Gray-Blue) Family */
--shark-50: #f8f9fa;
--shark-100: #e9ecef;
--shark-200: #8d8db1;
--shark-300: #6c757d;
--shark-500: #496771;
--shark-800: #3a4057;
--shark-900: #334048;
--shark-default: #212c30;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--white: #ffffff;
--black: #000000;
```

### Semantic Colors
```css
--success: #10b981;    /* Green */
--warning: #f59e0b;    /* Amber */
--error: #ef4444;      /* Red */
--info: #3b82f6;       /* Blue */
```

## Typography

### Font Family
```css
--font-sans: 'Montserrat', 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes (Extended Tailwind scale)
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Styles

| Style        | Font        | Weight    | Size  | Line Height | Token      | Usage |
|--------------|-------------|-----------|-------|-------------|------------|-------|
| Display XL   | Montserrat  | Bold (700)| 60px  | 72px        | text-6xl   | Hero headlines |
| Display LG   | Montserrat  | Bold      | 48px  | 56px        | text-5xl   | Large displays |
| Heading 1    | Montserrat  | Semibold  | 36px  | 44px        | text-4xl   | Main headings |
| Heading 2    | Montserrat  | Semibold  | 30px  | 36px        | text-3xl   | Section headings |
| Heading 3    | Montserrat  | Medium    | 24px  | 32px        | text-2xl   | Subsection headings |
| Heading 4    | Montserrat  | Medium    | 20px  | 28px        | text-xl    | Card headings |
| Body Large   | Poppins     | Normal    | 18px  | 28px        | text-lg    | Large body text |
| Body Medium  | Poppins     | Normal    | 16px  | 24px        | text-base  | Standard body text |
| Body Small   | Poppins     | Normal    | 14px  | 20px        | text-sm    | Small body text |
| Caption      | Poppins     | Medium    | 12px  | 16px        | text-xs    | Captions, labels |
| Button Text  | Poppins     | Semibold  | 14px  | 20px        | text-sm    | Button labels |

## Spacing Scale (Tailwind)

Use Tailwind's spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

## Border Radius
```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Default */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Modals */
--radius-2xl: 1.5rem;    /* 24px - Hero sections */
--radius-full: 9999px;   /* Pills/Circles */
```

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## Component Patterns

### Buttons

#### Button Variants

**Primary Button (Filled)**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none active:scale-[0.98]">
  Button Text
</button>
```

**Secondary Button (Outlined)**
```jsx
<button className="bg-white hover:bg-emerald-50 text-emerald-600 font-semibold px-6 py-3 rounded-full border-2 border-emerald-500 transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none active:scale-[0.98]">
  Button Text
</button>
```

**Ghost Button (Text Only)**
```jsx
<button className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none active:scale-[0.98]">
  Button Text
</button>
```

**Disabled Button**
```jsx
<button className="bg-gray-300 text-gray-500 font-semibold px-6 py-3 rounded-full cursor-not-allowed opacity-50">
  Button Text
</button>
```

#### Button Sizes

**Small Button**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-full text-sm transition-colors duration-200">
  Small
</button>
```

**Medium Button (Default)**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200">
  Medium
</button>
```

**Large Button**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors duration-200">
  Large
</button>
```

#### Button with Icons

**Icon Left**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 flex items-center">
  <Mail className="w-4 h-4 mr-2" />
  Button Text
</button>
```

**Icon Right**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 flex items-center">
  Button Text
  <Mail className="w-4 h-4 ml-2" />
</button>
```

**Icon Only**
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
  <Plus className="w-5 h-5" />
</button>
```

#### Loading Button
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Processing...
</button>
```

### Cards

#### Standard Card
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  {/* Card content */}
</div>
```

#### Feature Card
```jsx
<div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
  {/* Feature content */}
</div>
```

#### Stat Card
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
  <div className="text-3xl font-bold text-emerald-600 mb-2">
    {value}
  </div>
  <div className="text-gray-600 font-medium">
    {label}
  </div>
</div>
```

### Input Fields

#### Text Input
```jsx
<input 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-200"
  placeholder="Enter text..."
/>
```

#### Input with Icon
```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  <input 
    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-200"
    placeholder="Search..."
  />
</div>
```

### Badges

#### Badge Variants

**Basic Badge (Light)**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  Badge
</span>
```

**Basic Badge (Solid)**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500 text-white">
  Badge
</span>
```

**Badge with Leading Dot**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  <div className="w-2 h-2 bg-emerald-800 rounded-full mr-2"></div>
  Badge
</span>
```

**Badge with Trailing Close**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  Badge
  <X className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-600" />
</span>
```

#### Badge Color Variants

**Success Badge**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  Success
</span>
```

**Warning Badge**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
  Warning
</span>
```

**Error Badge**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
  Error
</span>
```

**Info Badge**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  Info
</span>
```

**Neutral Badge**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
  Neutral
</span>
```

#### Count Badge
```jsx
<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
  3
</span>
```

#### Status Badge with Icon
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  <CheckCircle className="w-3 h-3 mr-1" />
  Active
</span>
```

### Alerts

#### Success Alert
```jsx
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
  <div className="flex items-start">
    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-emerald-800">Success</h3>
      <p className="text-sm text-emerald-700 mt-1">Message here</p>
    </div>
  </div>
</div>
```

#### Warning Alert
```jsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <div className="flex items-start">
    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-amber-800">Warning</h3>
      <p className="text-sm text-amber-700 mt-1">Message here</p>
    </div>
  </div>
</div>
```

#### Error Alert
```jsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start">
    <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-red-800">Error</h3>
      <p className="text-sm text-red-700 mt-1">Message here</p>
    </div>
  </div>
</div>
```

### Loading States

#### Spinner
```jsx
<div className="flex items-center justify-center">
  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
</div>
```

#### Skeleton
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

#### Loading Button
```jsx
<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Processing...
</button>
```

### Progress Indicators

#### Linear Progress Bar
```jsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
</div>
```

#### Multi-Step Progress Bar
```jsx
<div className="flex items-center space-x-2">
  {steps.map((step, index) => (
    <div key={index} className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        step.completed 
          ? 'bg-emerald-500 text-white' 
          : step.active 
            ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' 
            : 'bg-gray-200 text-gray-500'
      }`}>
        {step.completed ? <Check className="w-4 h-4" /> : index + 1}
      </div>
      {index < steps.length - 1 && (
        <div className={`w-8 h-0.5 ${step.completed ? 'bg-emerald-500' : 'bg-gray-200'}`} />
      )}
    </div>
  ))}
</div>
```

#### Circular Progress
```jsx
<div className="relative w-16 h-16">
  <svg className="w-16 h-16 transform -rotate-90">
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200"/>
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`} className="text-emerald-500 transition-all duration-300"/>
  </svg>
  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-emerald-600">
    {progress}%
  </div>
</div>
```

#### Status Steps (KYC Style)
```jsx
<div className="space-y-4">
  <div className="flex items-start">
    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
      <CheckCircle className="w-5 h-5 text-white" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">Face Verification</h4>
      <p className="text-sm text-gray-600">Your profile capture has been verified.</p>
    </div>
  </div>
  
  <div className="flex items-start">
    <div className="w-8 h-8 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">ID Validation</h4>
      <p className="text-sm text-gray-600">Your ID is being checked. It will be processed shortly.</p>
    </div>
  </div>
</div>
```

#### Success State
```jsx
<div className="text-center py-8">
  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
    <CheckCircle className="w-8 h-8 text-white" />
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC completed successfully</h3>
  <p className="text-gray-600">proceed to make an offer</p>
</div>
```

### Score Cards

#### Property Score
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
  <div className="text-sm font-medium text-gray-600 mb-2">
    Overall Score
  </div>
  <div className="text-4xl font-bold text-emerald-600 mb-2">
    {score}/100
  </div>
  <div className="text-sm text-gray-500">
    Excellent opportunity
  </div>
</div>
```

### Benefit Cards & Information Banners

#### Benefit Card (KYC Style)
```jsx
<div className="bg-emerald-500 rounded-lg p-4 flex items-center">
  <TrendingUp className="w-6 h-6 text-white mr-3" />
  <div className="text-white">
    <div className="text-2xl font-bold">70%</div>
    <div className="text-sm">more chance of acceptance with a verified offer</div>
  </div>
</div>
```

#### Information Banner
```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex items-start">
    <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-blue-800">Information</h3>
      <p className="text-sm text-blue-700 mt-1">This is an informational message for the user.</p>
    </div>
  </div>
</div>
```

#### Success Banner
```jsx
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
  <div className="flex items-start">
    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-emerald-800">Success</h3>
      <p className="text-sm text-emerald-700 mt-1">Your action was completed successfully.</p>
    </div>
  </div>
</div>
```

#### Warning Banner
```jsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <div className="flex items-start">
    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-amber-800">Warning</h3>
      <p className="text-sm text-amber-700 mt-1">Please review this information carefully.</p>
    </div>
  </div>
</div>
```

### Data Display

#### Key-Value Pairs
```jsx
<div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
  <span className="text-gray-600 font-medium">Label</span>
  <span className="text-gray-900 font-semibold">Value</span>
</div>
```

#### Comparison Table
```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
    <div className="flex justify-between">
      <span className="font-semibold text-gray-900">Metric</span>
      <span className="font-semibold text-gray-900">Value</span>
    </div>
  </div>
  <div className="divide-y divide-gray-200">
    <div className="flex justify-between items-center px-6 py-3">
      <span className="text-gray-600">Label</span>
      <span className="text-gray-900 font-medium">Value</span>
    </div>
  </div>
</div>
```

## Animation Guidelines

### Hover Transitions
- Use `transition-all duration-200` for button hovers
- Use `transition-colors duration-200` for color-only changes
- Use `transition-transform duration-300` for scale/translate effects

### Enter/Exit Animations
```jsx
// Fade in
<div className="opacity-0 animate-fade-in">
  Content
</div>

// Slide in from bottom
<div className="transform translate-y-4 opacity-0 animate-slide-up">
  Content
</div>

// Fade + slide combo
<div className="transform translate-y-4 opacity-0 animate-fade-slide-up">
  Content
</div>
```

### Micro-interactions
- Scale buttons to 0.98 on click: `active:scale-[0.98]`
- Add subtle shadows on hover: `hover:shadow-lg`
- Smooth state changes: `transition-all duration-200`

## Icons (Lucide React)

### Required Icons
```jsx
import {
  // Actions
  Search, Download, Share2, Copy, ExternalLink, RefreshCw,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Minus, X, Check, Edit2, Trash2,
  
  // Status & Progress
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Info,
  TrendingUp, TrendingDown, Activity, Loader2,
  
  // KYC & Verification
  User, UserCheck, Shield, ShieldCheck, Camera, FileText,
  Smile, Frown, Meh, // For face verification states
  
  // Property Features  
  Home, Building, MapPin, Map, Navigation,
  Droplet, Trees, Car, Sun, Wind,
  
  // UI Elements
  Menu, Settings, Bell, Mail, Calendar, Clock,
  DollarSign, BarChart3, Eye, EyeOff, Filter,
  SortAsc, SortDesc, Database, Server,
  
  // Data & Files
  File, Folder, Image, Upload, Download,
  
  // Communication
  MessageCircle, Phone, Video, Send,
  
  // Navigation
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Home as HomeIcon, Search as SearchIcon
} from 'lucide-react';
```

### Icon Sizing
- **Tiny**: `w-3 h-3` - For badges and small indicators
- **Small**: `w-4 h-4` - For UI elements and buttons
- **Default**: `w-5 h-5` - Standard icon size
- **Large**: `w-6 h-6` - For feature highlights
- **Hero**: `w-8 h-8` - For main CTAs and hero sections
- **Display**: `w-12 h-12` - For large displays and cards

### Icon Usage Guidelines

**Status Icons**
```jsx
// Success states
<CheckCircle className="w-5 h-5 text-emerald-500" />
<Check className="w-4 h-4 text-emerald-600" />

// Warning states  
<AlertTriangle className="w-5 h-5 text-amber-500" />
<AlertCircle className="w-5 h-5 text-amber-500" />

// Error states
<XCircle className="w-5 h-5 text-red-500" />
<X className="w-4 h-4 text-red-600" />

// Info states
<Info className="w-5 h-5 text-blue-500" />
```

**Progress Icons**
```jsx
// Loading states
<Loader2 className="w-5 h-5 animate-spin text-emerald-500" />

// Progress indicators
<Activity className="w-5 h-5 text-emerald-500" />
<TrendingUp className="w-5 h-5 text-emerald-500" />
```

**KYC & Verification Icons**
```jsx
// Face verification
<Smile className="w-6 h-6 text-emerald-500" />
<User className="w-6 h-6 text-gray-400" />
<Camera className="w-5 h-5 text-gray-500" />

// Document verification
<FileText className="w-5 h-5 text-emerald-500" />
<Shield className="w-5 h-5 text-emerald-500" />
<ShieldCheck className="w-5 h-5 text-emerald-500" />
```

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Content */}
  </div>
</div>
```

### Two-Column Layout
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Left column */}
  {/* Right column */}
</div>
```

### Three-Column Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    {/* Grid item */}
  ))}
</div>
```

### Sidebar Layout
```jsx
<div className="flex min-h-screen">
  <div className="w-64 bg-white shadow-lg">
    {/* Sidebar */}
  </div>
  <div className="flex-1 bg-gray-50">
    {/* Main content */}
  </div>
</div>
```

## Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Include aria-labels for icon-only buttons
- Ensure color contrast meets WCAG AA standards (4.5:1 for text)
- Add focus states: `focus:ring-2 focus:ring-emerald-500 focus:outline-none`

## Internationalization (i18n)

### Supported Languages
- **English** (en) - Primary language
- **Portuguese** (pt) - Secondary language for Portuguese market

### Translation Guidelines
```jsx
// Use translation keys for all user-facing text
const translations = {
  en: {
    'property.analyze': 'Analyze Property',
    'property.loading': 'Analyzing...',
    'kyc.completed': 'KYC completed successfully',
    'kyc.proceed': 'proceed to make an offer',
    'verification.face': 'Face Verification',
    'verification.id': 'ID Validation'
  },
  pt: {
    'property.analyze': 'Analisar Propriedade',
    'property.loading': 'Analisando...',
    'kyc.completed': 'KYC concluído com sucesso',
    'kyc.proceed': 'por favor, prossiga para fazer uma proposta',
    'verification.face': 'Verificação Facial',
    'verification.id': 'Validação de ID'
  }
};
```

### RTL Support (Future)
```jsx
// Example RTL classes for future Arabic/Hebrew support
<div className="text-right rtl:text-left">
  Content
</div>
```

## Dark Mode Support (Future)
```jsx
// Example dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Component Examples

### Header
```jsx
<header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ProprScout</h1>
          <p className="text-sm text-gray-500">Intelligence</p>
        </div>
      </div>
      <nav className="flex items-center space-x-6">
        <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
          Get Started
        </button>
      </nav>
    </div>
  </div>
</header>
```

### Feature Section
```jsx
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Property Intelligence in Seconds
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Analyze any property listing with AI-powered insights
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h3>
        <p className="text-gray-600">30-second deep dive into any property</p>
      </div>
      {/* More features */}
    </div>
  </div>
</section>
```

## Best Practices

1. **Consistency**: Use the same spacing, colors, and patterns throughout
2. **Performance**: Minimize animations on low-end devices
3. **Mobile-first**: Design for mobile, enhance for desktop
4. **Feedback**: Provide visual feedback for all user actions
5. **Hierarchy**: Use size, weight, and color to establish importance
6. **White space**: Don't overcrowd - let content breathe
7. **Loading states**: Always show progress for async operations
8. **Error handling**: Make errors clear and actionable

---

**This design system should be referenced for ALL component creation in ProprScout.**
