'use client'
import { publicItems } from '../../lib/data'
import AppTabBar from '../../components/AppTabBar'
import Image from 'next/image'

export default function Browse(){
  return (
    <>
      <main className="mx-auto max-w-xl px-4 pb-[88px] pt-6 space-y-3">
        <h1 className="text-xl font-semibold">둘러보기</h1>
        <div className="grid grid-cols-2 gap-3">
          {publicItems.map(item=>(
            <a key={item.id} href={`/item/${item.id}`}
               className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <div className="relative aspect-square">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="px-2 py-2 text-xs text-white/80">{item.title}</div>
            </a>
          ))}
        </div>
      </main>
      <AppTabBar />
    </>
  )
}