import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(0, -5)">
            <path
              d="M38 70 L50 95 L62 70 Z"
              fill="#f2c58a"
              stroke="#000000"
              strokeWidth="2"
            />
            
            <circle cx="50" cy="25" r="14" fill="#f2d53c" stroke="#000" strokeWidth="2"/>
            <path d="M50,15 A10,10 0 0,1 60,25" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M50,15 A10,10 0 0,0 40,25" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M50,35 A10,10 0 0,1 60,25" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M50,35 A10,10 0 0,0 40,25" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M43,25 A7,7 0 0,1 50,18" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M57,25 A7,7 0 0,1 50,32" fill="none" stroke="#000" strokeWidth="2"/>

            <circle cx="34" cy="50" r="14" fill="#7d8fdb" stroke="#000" strokeWidth="2"/>
            <path d="M34,40 A10,10 0 0,1 44,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M34,40 A10,10 0 0,0 24,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M34,60 A10,10 0 0,1 44,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M34,60 A10,10 0 0,0 24,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M27,50 A7,7 0 0,1 34,43" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M41,50 A7,7 0 0,1 34,57" fill="none" stroke="#000" strokeWidth="2"/>

            <circle cx="66" cy="50" r="14" fill="#d93b3b" stroke="#000" strokeWidth="2"/>
            <path d="M66,40 A10,10 0 0,1 76,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M66,40 A10,10 0 0,0 56,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M66,60 A10,10 0 0,1 76,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M66,60 A10,10 0 0,0 56,50" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M59,50 A7,7 0 0,1 66,43" fill="none" stroke="#000" strokeWidth="2"/>
            <path d="M73,50 A7,7 0 0,1 66,57" fill="none" stroke="#000" strokeWidth="2"/>
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
