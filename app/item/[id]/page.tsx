'use client'
import { useRouter } from 'next/navigation'
import { publicItems, templates } from '../../../lib/data'
import Image from 'next/image'

export default function ItemPage({ params }:{ params:{ id:string } }) {
  const router = useRouter()
  const item = publicItems.find(i=>i.id===params.id)
  if(!item) return <main className="mx-auto max-w-xl px-4 pt-6">Not found</main>
  const tpl = templates.find(t=>t.id===item.templateId)!

  return (
    <main className="mx-auto max-w-xl px-4 pt-6 pb-24 space-y-4">
      <button className="btn-outline" onClick={()=>router.back()}>← 뒤로</button>
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="relative aspect-square">
          <Image src={item.image} alt={item.title} fill className="object-cover" />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={()=>router.push(`/editor?mode=template&tpl=${encodeURIComponent(tpl.id)}`)}>
          이 템플릿 사용
        </button>
        <a href="/templates" className="btn-outline">다른 템플릿</a>
      </div>
    </main>
  )
}