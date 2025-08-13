'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AppTopBar from '../../components/AppTopBar'
import AppTabBar from '../../components/AppTabBar'
import { templates } from '../../lib/data'

type Align = 'left'|'center'|'right'
type Kind = 'text'|'sticker'

type BaseEl = { id:string; kind:Kind; x:number; y:number; scale:number; rotation:number; opacity:number }
type TextEl = BaseEl & { kind:'text'; text:string; fontSize:number; color:string; strokeColor:string; strokeWidth:number; align:Align }
type StickerEl = BaseEl & { kind:'sticker'; src:string }
type El = TextEl | StickerEl

const CANVAS = 1080
const uid = () => Math.random().toString(36).slice(2, 10)
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n))

// 간단 스티커(원하는 PNG를 public/stickers 에 넣어서 경로만 추가)
const STICKERS = [
  '/stickers/y2k-stars.jpeg',
  '/stickers/blue-pin.jpeg',
  '/stickers/exclamation.jpeg',
  '/stickers/question-mark.jpeg',
  '/stickers/red-pin.jpeg',
  '/stickers/thunder.jpeg'
].filter(Boolean)

export default function Editor() {
  const sp = useSearchParams()
  const [bg, setBg] = useState('/templates/retro.jpg') // 기본값 (쿼리로 덮임)
  const [els, setEls] = useState<El[]>([])              // 텍스트/스티커 공통 배열
  const [sel, setSel] = useState<string|null>(null)
  const selected = useMemo(()=>els.find(e=>e.id===sel) ?? null,[els,sel])
  const [mime, setMime] = useState<'image/png'|'image/jpeg'>('image/png')

  // 프리뷰 박스 크기
  const wrapRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState(0)
  useEffect(()=>{
    const on=()=>setView(wrapRef.current?.clientWidth ?? 0)
    on(); addEventListener('resize',on); return ()=>removeEventListener('resize',on)
  },[])
  const px = (v:number)=> Math.max(8, Math.round(v * (view/1080 || 0.5)))

  // 진입 모드 반영 (템플릿/업로드)
  useEffect(()=>{
    const mode = sp.get('mode')
    const raw  = sp.get('tpl')
    const tpl  = raw ? decodeURIComponent(raw) : null

    if (mode === 'upload') {
      const data = sessionStorage.getItem('pendingUpload')
      if (data) setBg(data)
    } else if (mode === 'template' && tpl) {
      const hit = templates.find(t=>t.id===tpl)
      if (hit) setBg(hit.src)
    }
  }, [sp])

  // 드래그
  const dragRef = useRef<{id:string; offX:number; offY:number} | null>(null)
  const startDrag = (e:React.PointerEvent, id:string)=>{
    if ((e.target as HTMLElement).closest('[data-control]')) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const cx = (e.clientX-rect.left)/rect.width
    const cy = (e.clientY-rect.top)/rect.height
    const el = els.find(x=>x.id===id)!; setSel(id)
    dragRef.current = { id, offX: cx - el.x, offY: cy - el.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e:React.PointerEvent)=>{
    if(!dragRef.current) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const cx = (e.clientX-rect.left)/rect.width
    const cy = (e.clientY-rect.top)/rect.height
    // 요소가 화면에서 벗어나지 않도록 0~1로 클램프
    setEls(p=>p.map(el=> el.id===dragRef.current!.id
      ? { ...el, x: clamp(cx - dragRef.current!.offX, 0.02, 0.98), y: clamp(cy - dragRef.current!.offY, 0.02, 0.98) }
      : el))
  }
  const endDrag = (e:React.PointerEvent)=>{ dragRef.current=null; try{(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)}catch{} }

  // 내보내기
  const renderToDataURL = async (fmt:'png'|'jpeg')=>{
    const c=document.createElement('canvas'); c.width=CANVAS; c.height=CANVAS
    const ctx=c.getContext('2d')!
    const img=await loadImage(bg)
    const s=Math.max(CANVAS/img.width, CANVAS/img.height)
    const dw=img.width*s, dh=img.height*s
    ctx.drawImage(img,(CANVAS-dw)/2,(CANVAS-dh)/2,dw,dh)

    // 렌더
    for (const el of els) {
      ctx.save()
      ctx.globalAlpha = el.opacity/100
      if (el.kind==='text') {
        ctx.textAlign=el.align; ctx.textBaseline='middle'
        ctx.font=`bold ${el.fontSize}px 'Anton', Impact, system-ui, sans-serif`
        drawParagraph(ctx, el.text, el.align, el.color, el.strokeColor, el.strokeWidth,
          el.x*CANVAS, el.y*CANVAS, CANVAS-120, el.fontSize)
      } else {
        const imgS = await loadImage(el.src)
        const base = 256
        const size = base * el.scale
        ctx.translate(el.x*CANVAS, el.y*CANVAS)
        ctx.rotate(el.rotation*Math.PI/180)
        ctx.drawImage(imgS, -size/2, -size/2, size, size)
      }
      ctx.restore()
    }
    return c.toDataURL(fmt==='png'?'image/png':'image/jpeg')
  }
  const onSave = async ()=>{
    const url=await renderToDataURL(mime==='image/png'?'png':'jpeg')
    const a=document.createElement('a'); a.href=url; a.download=`meme-${Date.now()}.${mime==='image/png'?'png':'jpg'}`; a.click()
  }

  // 요소 추가/삭제/갱신
  const addText = ()=>{
    const t:TextEl = { id:uid(), kind:'text', text:'텍스트', x:.5, y:.2, fontSize:96, color:'#fff',
      strokeColor:'#000', strokeWidth:6, align:'center', opacity:100, scale:1, rotation:0 }
    setEls(p=>[...p, t]); setSel(t.id)
  }
  const addSticker = (src:string)=>{
    const s:StickerEl = { id:uid(), kind:'sticker', src, x:.5, y:.5, scale:1, rotation:0, opacity:100 }
    setEls(p=>[...p, s]); setSel(s.id)
  }
  const removeSel = ()=>{ if(!sel) return; setEls(p=>p.filter(e=>e.id!==sel)); setSel(null) }
  const updateSel = (patch: Partial<TextEl & StickerEl>)=>{
    if(!sel) return
    setEls(p=>p.map(e=> e.id===sel ? { ...e, ...patch } as El : e))
  }

  return (
    <>
      {/* Share 제거, 중앙 타이틀 */}
      <AppTopBar title="Editor" onSave={onSave} />

      <main className="app-safe mx-auto max-w-xl px-4 space-y-4">
        {/* Preview */}
        <div
          ref={wrapRef}
          className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black"
          onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}
          onClick={()=>setSel(null)}
        >
          <img src={bg} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
          {els.map(el=>{
            if (el.kind==='text') {
              return (
                <div
                  key={el.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 select-none
                    ${sel===el.id ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-black rounded' : ''}`}
                  style={{
                    left:`${el.x*100}%`, top:`${el.y*100}%`, lineHeight:1.1,
                    fontSize:`${px(el.fontSize)}px`, fontWeight:700, opacity: el.opacity/100,
                    color: el.color, textAlign: el.align as any,
                    WebkitTextStrokeWidth: el.strokeWidth ? `${Math.max(1, px(el.strokeWidth))}px` : undefined,
                    WebkitTextStrokeColor: el.strokeWidth ? el.strokeColor : undefined,
                    // 드롭섀도우 제거(진짜 아웃라인만)
                    textShadow: 'none', userSelect:'none', WebkitUserSelect:'none'
                  }}
                  onPointerDown={(e)=>startDrag(e, el.id)}
                  onClick={(e)=>{ e.stopPropagation(); setSel(el.id) }}
                >
                  {el.text}
                  {sel===el.id && (
                    <button
                      data-control
                      onPointerDown={(e)=>{ e.stopPropagation(); e.preventDefault() }}
                      onClick={(e)=>{ e.stopPropagation(); removeSel() }}
                      className="absolute -top-6 -right-6 z-10 w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold grid place-items-center shadow"
                      title="삭제"
                    >×</button>
                  )}
                </div>
              )
            }
            // sticker
            const size = 256 * el.scale * (view/1080 || .5)
            return (
              <div
                key={el.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 select-none
                  ${sel===el.id ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-black rounded-xl' : ''}`}
                style={{
                  left:`${el.x*100}%`, top:`${el.y*100}%`, width:size, height:size, opacity: el.opacity/100,
                  transform:`translate(-50%,-50%) rotate(${el.rotation}deg)`
                }}
                onPointerDown={(e)=>startDrag(e, el.id)}
                onClick={(e)=>{ e.stopPropagation(); setSel(el.id) }}
              >
                <img src={(el as StickerEl).src} alt="sticker" className="w-full h-full object-contain pointer-events-none" />
                {sel===el.id && (
                  <button
                    data-control
                    onPointerDown={(e)=>{ e.stopPropagation(); e.preventDefault() }}
                    onClick={(e)=>{ e.stopPropagation(); removeSel() }}
                    className="absolute -top-6 -right-6 z-10 w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold grid place-items-center shadow"
                    title="삭제"
                  >×</button>
                )}
              </div>
            )
          })}
        </div>

        {/* 하단 패널: 고정 높이 + 내부 스크롤 → overflow 방지 */}
        <section className="retro-card space-y-3 max-h-64 overflow-y-auto">

          {/* 요소 추가 */}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn" onClick={addText}>텍스트 추가</button>
            <details className="w-full">
              <summary className="btn-outline cursor-pointer list-none">스티커 추가</summary>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {STICKERS.map(s=>(
                  <button key={s} className="rounded-xl border border-white/10 bg-white/5 p-2"
                          onClick={()=>addSticker(s)}>
                    <img src={s} className="w-full h-full object-contain" alt="sticker"/>
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* 선택 속성 */}
          {selected && selected.kind==='text' && (
            <>
              <input className="input" value={selected.text}
                     onChange={e=>updateSel({ text:e.target.value })} placeholder="텍스트 입력"/>
              <div className="grid grid-cols-3 gap-2">
                <Range label="크기" value={selected.fontSize} min={24} max={160}
                       onChange={v=>updateSel({ fontSize:v })}/>
                <Color label="색상" value={selected.color} onChange={v=>updateSel({ color:v })}/>
                <Color label="외곽선색" value={selected.strokeColor} onChange={v=>updateSel({ strokeColor:v })}/>
                <Range label="외곽선" value={selected.strokeWidth} min={0} max={20} step = {1}
                       onChange={v=>updateSel({ strokeWidth:v })}/>
                <Range label="불투명도" value={selected.opacity} min={10} max={100}
                       onChange={v=>updateSel({ opacity:v })}/>
                <div className="flex items-center gap-2 text-sm">
                  <span>정렬</span>
                  <button className="btn-outline" onClick={()=>updateSel({ align:'left' })}>좌</button>
                  <button className="btn-outline" onClick={()=>updateSel({ align:'center' })}>중</button>
                  <button className="btn-outline" onClick={()=>updateSel({ align:'right' })}>우</button>
                </div>
              </div>
            </>
          )}
          {selected && selected.kind==='sticker' && (
            <div className="grid grid-cols-3 gap-2">
              <Range label="크기" value={selected.scale} min={0.5} max={2} step={0.1}
                     onChange={v=>updateSel({ scale:v })}/>
              <Range label="회전" value={selected.rotation} min={-180} max={180}
                     onChange={v=>updateSel({ rotation:v })}/>
              <Range label="불투명도" value={selected.opacity} min={10} max={100}
                     onChange={v=>updateSel({ opacity:v })}/>
            </div>
          )}

          {/* 내보내기 */}
          <div className="flex items-center gap-2">
            <select className="input" value={mime} onChange={e=>setMime(e.target.value as any)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
            <button className="btn ml-auto" onClick={onSave}>Export</button>
          </div>
        </section>
      </main>

      <AppTabBar />
    </>
  )
}

/* ---- 작은 UI ---- */
function Range({ label, value, onChange, min, max, step=1 }:{
  label:string; value:number; onChange:(v:number)=>void; min:number; max:number; step?:number
}) {
  const fmt = (n:number)=> (step < 1 ? n.toFixed(1) : Math.round(n).toString())
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-white/70">
        {label} <span className="tabular-nums">{fmt(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e)=>onChange(Number(e.target.value))}/>
    </label>
  )
}
function Color({ label, value, onChange }:{ label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-white/70">{label}</span>
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  )
}

/* ---- 헬퍼 ---- */
function loadImage(src:string){ return new Promise<HTMLImageElement>((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src }) }
function drawParagraph(ctx:CanvasRenderingContext2D, text:string, align:Align, fill:string, stroke:string, sw:number, cx:number, cy:number, maxW:number, sz:number){
  const words=text.split(/(\s+)/); const lines:string[]=[]; let line=''
  for(const w of words){ const t=line+w; if(ctx.measureText(t).width>maxW && line.trim()!==''){ lines.push(line.trimEnd()); line=w.trimStart() } else line=t }
  if(line) lines.push(line.trimEnd())
  const lh=sz*1.1, start=cy-(lines.length-1)*lh/2
  for(let i=0;i<lines.length;i++){ ctx.lineWidth=sw; ctx.strokeStyle=stroke; ctx.fillStyle=fill; ctx.textAlign=align as any; ctx.strokeText(lines[i],cx,start+i*lh); ctx.fillText(lines[i],cx,start+i*lh) }
}