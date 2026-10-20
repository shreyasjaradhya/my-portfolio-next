import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0ea5e9',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '4px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21V9h-2c-.943 0-1.414 0-1.707.293S8 10.057 8 11v10m8 0V11c0-.943 0-1.414-.293-1.707S14.943 9 14 9h-2v12m8-16v4m2-2h-4M6 7H2m8 2V6c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C8.398 3 7.932 3 7 3m7 6V6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C15.602 3 16.068 3 17 3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

