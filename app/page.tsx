import HardwareBoard from '@/components/HardwareBoard'
import AsciiBackground from '@/components/AsciiBackground'

export default function Home() {
  return (
    <>
      <AsciiBackground />
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: 1000,
        }}
      >
        {/*
          Scale wrapper — only scales DOWN when viewport is too small.
          920 = board width, 860 = board height (640) + smiski hanging below (~210px) + padding.
          transform-origin: center so it stays centered within the flex container.
          The 48px margin gives breathing room on all sides.
        */}
        <div style={{
          transform: 'scale(min(1, min(calc((100vw - 48px) / 920), calc((100vh - 48px) / 860))))',
          transformOrigin: 'center center',
          paddingBottom: 218,
        }}>
          <HardwareBoard />
        </div>
      </main>
    </>
  )
}
