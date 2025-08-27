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
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'hsl(16 72% 68.4%)', // Primary color from your theme (pinkish)
          color: '#FFFFFF', // White color for the letter
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontFamily: '"Playfair Display", serif'
        }}
      >
        R
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
