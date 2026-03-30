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
        <HardwareBoard />
      </main>
    </>
  )
}
