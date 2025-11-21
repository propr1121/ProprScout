# ProprScout Logo Sizing Solution

## Problem
The ProprScout logo appears tiny within its container despite setting width/height attributes. The logo doesn't scale properly and remains small.

## Root Cause
- SVG dimensions don't automatically scale to fill container
- Padding reduces available space for the logo
- Original SVG paths are designed for a specific viewBox that doesn't scale well

## Solution: CSS Transform Scaling

### Step-by-Step Fix:

1. **Keep Original SVG Structure:**
   ```jsx
   <svg
     width="48"
     height="48"
     viewBox="0 0 1200 750"
     fill="none"
     xmlns="http://www.w3.org/2000/svg"
   >
   ```

2. **Add CSS Transform Scale:**
   ```jsx
   style={{
     display: 'block',
     width: '48px',
     height: '48px',
     transform: 'scale(3)'  // 3x larger
   }}
   ```

3. **Remove Container Padding:**
   ```jsx
   <div className="rounded-lg bg-primary-500 w-12 h-12 flex items-center justify-center" 
        style={{ padding: '0px' }}>
   ```

4. **Use Original ProprScout Paths:**
   ```jsx
   <g fill="#FFFFFF" stroke="none">
     <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
     <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
     <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
   </g>
   ```

## Why This Works

- **Transform Scale:** Scales the entire SVG without changing container dimensions
- **No Padding:** Gives maximum space for the scaled logo
- **Original Paths:** Maintains the authentic ProprScout design
- **Consistent:** Works for both header and footer logos

## Scale Values

- `scale(1.5)` = 50% larger
- `scale(2)` = 100% larger (double size)
- `scale(3)` = 200% larger (triple size) ← **Recommended**

## Files Updated

- `src/components/LandingPage.jsx` (Header logo)
- `src/components/LandingPage.jsx` (Footer logo)
- `src/App.jsx` (Dashboard header logo)

## Future Prevention

Always use `transform: 'scale(X)'` instead of changing SVG dimensions when logos appear too small. This approach maintains the original design while achieving the desired size.
