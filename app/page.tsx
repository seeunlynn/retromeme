'use client'
import { useRouter } from 'next/navigation'
import { templates, publicItems } from '../lib/data'
import AppTabBar from '../components/AppTabBar'
import Image from 'next/image'
import { useRef } from 'react'

export default function Home() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const onPickFromGallery = () => fileRef.current?.click()
  const onFile = (f: File) => {
    const r = new FileReader()
    r.onload = () => {
      sessionStorage.setItem('pendingUpload', String(r.result))
      router.push('/editor?mode=upload')
    }
    r.readAsDataURL(f)
  }

  return (
    <>
      <main className="mx-auto max-w-xl px-4 pb-[88px] pt-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Retro Meme Studio</h1>
          <p className="text-white/60 text-sm">템플릿으로 만들거나, 갤러리에서 이미지를 선택하세요.</p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn" onClick={()=>location.assign('/templates')}>템플릿으로 만들기</button>
          <button className="btn-outline" onClick={onPickFromGallery}>갤러리에서 선택</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
                 onChange={e=>e.target.files && onFile(e.target.files[0])}/>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold">다른 사람들이 만든 결과물</h2>
          <div className="grid grid-cols-2 gap-3">
            {publicItems.slice(0,6).map(item=>(
              <button key={item.id} onClick={()=>location.assign(`/item/${item.id}`)}
                className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <div className="relative aspect-square">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="px-2 py-2 text-xs text-white/80">{item.title}</div>
              </button>
            ))}
          </div>
        </section>
      </main>
      <AppTabBar />
    </>
  )
}