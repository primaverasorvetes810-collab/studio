import type { SVGProps } from "react";

export function PrimaveraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 75"
      width="260"
      height="75"
      {...props}
    >
      <defs>
        <style>
          {`
          .primavera-font { font-family: 'Lilita One', cursive; }
          `}
        </style>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g style={{ filter: 'url(#glow)' }}>
        <text
          x="10"
          y="50"
          className="primavera-font"
          fontSize="40"
          fill="#34A853"
          stroke="#E0F2F1"
          strokeWidth="4"
          paintOrder="stroke"
        >
          Prima
        </text>
        <text
          x="115"
          y="50"
          className="primavera-font"
          fontSize="40"
          fill="#EA4335"
          stroke="#FCE8E6"
          strokeWidth="4"
          paintOrder="stroke"
        >
          v
        </text>
        <text
          x="135"
          y="50"
          className="primavera-font"
          fontSize="40"
          fill="#FBBC05"
          stroke="#FFFDE7"
          strokeWidth="4"
          paintOrder="stroke"
        >
          er
        </text>
        <text
          x="170"
          y="50"
          className="primavera-font"
          fontSize="40"
          fill="#4285F4"
          stroke="#E8EAF6"
          strokeWidth="4"
          paintOrder="stroke"
        >
a
        </text>
      </g>
      
      <text
        x="170"
        y="70"
        className="primavera-font"
        fontSize="18"
        fill="#4A90E2"
        stroke="#FFFFFF"
        strokeWidth="3"
        paintOrder="stroke"
      >
        Sorvetes
      </text>

      <g transform="translate(190, 5)">
        {/* Yellow Rose */}
        <g transform="translate(-10, 0)">
          <circle cx="10" cy="10" r="10" fill="#FBBC05" />
          <path d="M 10 3 A 7 7 0 0 1 17 10 A 3 3 0 0 1 14 13 A 7 7 0 0 1 3 10 A 3 3 0 0 1 6 7 A 7 7 0 0 1 10 3 Z" fill="none" stroke="white" strokeWidth="1.2"/>
        </g>
        {/* Blue Rose */}
        <g transform="translate(5, 10)">
          <circle cx="10" cy="10" r="10" fill="#4285F4" />
          <path d="M 10 3 A 7 7 0 0 1 17 10 A 3 3 0 0 1 14 13 A 7 7 0 0 1 3 10 A 3 3 0 0 1 6 7 A 7 7 0 0 1 10 3 Z" fill="none" stroke="white" strokeWidth="1.2"/>
        </g>
        {/* Red Rose */}
        <g transform="translate(20, 0)">
          <circle cx="10" cy="10" r="10" fill="#EA4335" />
          <path d="M 10 3 A 7 7 0 0 1 17 10 A 3 3 0 0 1 14 13 A 7 7 0 0 1 3 10 A 3 3 0 0 1 6 7 A 7 7 0 0 1 10 3 Z" fill="none" stroke="white" strokeWidth="1.2"/>
        </g>
      </g>
    </svg>
  );
}

// Helper component to load Google Fonts.
function GoogleFontLoader() {
    return (
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap"
          rel="stylesheet"
        />
    );
}
