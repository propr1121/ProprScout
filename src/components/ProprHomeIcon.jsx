// ProprHomeIcon.jsx
import React from "react";

/**
 * ProprHomeIcon
 * - preserves the original SVG viewBox (0 0 1200 750)
 * - forces fill to white
 * - scales to fit inside a square container with padding so no part is clipped
 *
 * Props:
 *  - size: number in px for the outer rounded square (default: 64)
 *  - gap: inner padding in px between the emblem and the square edges (default: 12)
 */
export default function ProprHomeIcon({ size = 64, gap = 12, ariaLabel = "ProprHome logo" }) {
  const innerSize = Math.max(0, size - gap * 2);

  const wrapperStyle = {
    width: size + "px",
    height: size + "px",
    backgroundColor: "#08B881", // substitute your green
    borderRadius: Math.round(size * 0.18) + "px", // similar rounded corner
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(3,30,15,0.12)",
    boxSizing: "border-box",
    padding: gap + "px",
    overflow: "hidden", // keep contained shape
  };

  // We set svg width/height to 100% so it scales to the padded area
  return (
    <div style={wrapperStyle} aria-hidden="false" role="img" aria-label={ariaLabel}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 750"         // <-- original viewBox from your source file
        preserveAspectRatio="xMidYMid meet"
        width={innerSize}
        height={innerSize}
        style={{ display: "block", width: "100%", height: "100%" }}
        aria-hidden="true"
        focusable="false"
      >
        {/* force all fills to white even if original file uses gradients */}
        <style>{`path, rect, circle, g { fill: #ffffff !important; stroke: none !important; }`}</style>

        {/* Complete ProprHome logomark path */}
        <path d="M574.8,156.7c-12.9-12.9-33.7-12.9-46.6,0L245.4,439.4c-12.9,12.9-12.9,33.7,0,46.6l72.3,72.3c12.9,12.9,33.7,12.9,46.6,0
          l120.3-120.3v395.8c0,18.2,14.8,33,33,33h86.8c18.2,0,33-14.8,33-33V438l120.3,120.3c12.9,12.9,33.7,12.9,46.6,0l72.3-72.3
          c12.9-12.9,12.9-33.7,0-46.6L574.8,156.7z" />
      </svg>
    </div>
  );
}
