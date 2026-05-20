import { useEffect, useRef, useState } from "react";

const BG_VIDEO_SRC = "/landing-bg.mp4";

export function BackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    v.play().catch(() => {});
  }, [failed]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {!failed && (
        <video
          ref={ref}
          src={BG_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
          className={`size-full object-cover transition-opacity duration-1000 ${
            ready ? "opacity-40" : "opacity-0"
          }`}
        />
      )}
      {failed && (
        <div
          className="size-full opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 20%, color-mix(in oklab, var(--amber-glow) 35%, transparent), var(--background) 70%)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 30%, color-mix(in oklab, var(--background) 30%, transparent), var(--background) 85%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-color"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--amber-glow) 25%, transparent), transparent 60%)",
        }}
      />
    </div>
  );
}
