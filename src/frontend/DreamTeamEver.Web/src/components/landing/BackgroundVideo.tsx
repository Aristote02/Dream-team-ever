import { useEffect, useRef, useState } from 'react'

/** Place `landing-bg.mp4` in `public/` (served at `/landing-bg.mp4`). */
const BG_VIDEO_SRC = '/landing-bg.mp4'

export function BackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.play().catch(() => {})
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        ref={ref}
        src={BG_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        className="size-full object-cover transition-opacity duration-1000"
        style={{ opacity: ready ? 'var(--landing-video-opacity, 0.35)' : 0 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 30%, color-mix(in oklab, var(--landing-bg) 30%, transparent), var(--landing-bg) 85%)',
        }}
      />
      <div
        className="absolute inset-0 mix-blend-color"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--amber-glow) 25%, transparent), transparent 60%)',
        }}
      />
    </div>
  )
}
