'use client'
import { useRouter } from 'next/navigation'

export default function AppTopBar({
  title,
  onShare,
  onSave
}: { title: string; onShare?: () => void; onSave?: () => void }) {
  const router = useRouter()
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-xl h-full px-3 flex items-center justify-between">
        <button
          className="px-3 py-1 rounded-xl bg-white/5 text-white text-sm"
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <div className="font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              className="px-3 py-1 rounded-xl bg-white/5 text-white text-sm"
              onClick={onShare}
            >Share</button>
          )}
          {onSave && (
            <button
              className="px-3 py-1 rounded-xl bg-yellow-300 text-black text-sm font-bold"
              onClick={onSave}
            >Save</button>
          )}
        </div>
      </div>
    </header>
  )
}