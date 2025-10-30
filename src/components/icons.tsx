
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
      <text
        x="10"
        y="55"
        style={{ fontFamily: "'Lilita One', cursive" }}
        fontSize="50"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        paintOrder="stroke"
      >
        Primavera
      </text>
      
      <text
        x="160"
        y="70"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        fontSize="18"
        fontWeight="600"
        fill="hsl(var(--secondary-foreground))"
      >
        Sorvetes
      </text>

      {/* Simple decorative element */}
      <circle cx="240" cy="20" r="8" fill="hsl(var(--primary) / 0.8)" />
      <circle cx="235" cy="35" r="12" fill="hsl(var(--accent) / 0.7)" />
       <circle cx="245" cy="50" r="10" fill="hsl(var(--primary) / 0.9)" />

    </svg>
  );
}
