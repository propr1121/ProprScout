import React from "react";

export default function ProprHomeLogo({ size = 48 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1080"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: "block",
        fill: "white",
      }}
    >
      <path d="M574.8,156.7c-12.9-12.9-33.7-12.9-46.6,0L245.4,439.4c-12.9,12.9-12.9,33.7,0,46.6l72.3,72.3c12.9,12.9,33.7,12.9,46.6,0
        l120.3-120.3v395.8c0,18.2,14.8,33,33,33h86.8c18.2,0,33-14.8,33-33V438l120.3,120.3c12.9,12.9,33.7,12.9,46.6,0l72.3-72.3
        c12.9-12.9,12.9-33.7,0-46.6L574.8,156.7z" />
    </svg>
  );
}
