'use client'
import { useRouter } from 'next/navigation'

export default function AppTopBar({
  title,
  onSave
}: { title: string; onSave?: () => void }) {
  const router = useRouter()
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="relative mx-auto max-w-xl h-full px-3 flex items-center justify-center">
        {/* Left: Back */}
        <button
          className="absolute left-3 px-3 py-1 rounded-xl bg-white/5 text-white text-sm"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        {/* Center: Title */}
        <div className="text-sm font-semibold">{title}</div>

        {/* Right: Save */}
        {onSave && (
          <button
            className="absolute right-3 px-3 py-1 rounded-xl bg-yellow-300 text-black text-sm font-bold"
            onClick={onSave}
          >
            Save
          </button>
        )}
      </div>
    </header>
  )
}