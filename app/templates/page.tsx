'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { templates } from '../../lib/data'

export default function Templates(){
  const router = useRouter()

  return (
    <>
      {/* 상단 앱바: 뒤로가기 + 중앙 타이틀 */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="relative mx-auto max-w-xl h-full px-3 flex items-center justify-center">
          <button
            className="absolute left-3 px-3 py-1 rounded-xl bg-white/5 text-white text-sm"
            onClick={()=>router.back()}
          >
            ← Back
          </button>
          <div className="text-sm font-semibold">템플릿 선택</div>
        </div>
      </header>

      <main className="app-safe mx-auto max-w-xl px-4 pt-6 pb-24 space-y-4">
        <div className="grid grid-cols-3 gap-3">{/* ⬅︎ 3열 */}
          {templates.map(t=>(
            <a key={t.id}
               href={`/editor?mode=template&tpl=${encodeURIComponent(t.id)}`}
               className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <div className="relative aspect-square">
                <Image src={t.src} alt={t.title} fill className="object-cover" />
              </div>
              <div className="px-2 py-2 text-xs text-white/80 truncate">{t.title}</div>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}