
'use client'
import { useEffect, useState } from 'react'

export default function Result() {
  const [data, setData] = useState<string | null>(null)
  useEffect(()=>{ setData(localStorage.getItem('lastMeme')) },[])
  if (!data) return <div className="text-center">결과 이미지가 없습니다. 다시 시도해주세요.</div>
  const download = () => { const a = document.createElement('a'); a.href = data!; a.download = `meme-${Date.now()}.png`; a.click() }
  return (
    <div className="retro-card">
      <h1 className="font-bold mb-3">생성된 밈</h1>
      <div className="grid place-items-center"><img src={data!} alt="result" className="w-full max-w-[540px] rounded-xl border border-white/10" /></div>
      <div className="flex gap-2 justify-center mt-4">
        <button className="btn" onClick={download}>다운로드</button>
        <a href="/editor" className="btn-outline">다시 만들기</a>
      </div>
    </div>
  )
}
