'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import AppTopBar from '@/components/AppTopBar'
import AppTabBar from '@/components/AppTabBar'

type Align = 'left'|'center'|'right'
type TextEl = { id:string; text:string; x:number; y:number; fontSize:number; color:string; strokeColor:string; strokeWidth:number; align:Align; opacity:number }
const CANVAS = 1080
const uid = () => Math.random().toString(36).slice(2, 10)
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n))

export default function Editor() {
  const [bg, setBg] = useState('/templates/drake.jpg')
  const [els, setEls] = useState<TextEl[]>([mkTop(), mkBottom()])
  const [sel, setSel] = useState<string|null>(null)
  const selected = useMemo(()=>els.find(e=>e.id===sel)??null,[els,sel])
  const [mime, setMime] = useState<'image/png'|'image/jpeg'>('image/png')

  const wrapRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState(0)
  useEffect(()=>{ const on=()=>setView(wrapRef.current?.clientWidth??0); on(); addEventListener('resize',on); return()=>removeEventListener('resize',on) },[])
  const dragRef = useRef<{id:string;offX:number;offY:number}|null>(null)

  // === drag handlers (컨트롤 클릭시 드래그 시작 금지) ===
  const startDrag = (e:React.PointerEvent, id:string)=>{
    if ((e.target as HTMLElement).closest('[data-control]')) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const cx = (e.clientX-rect.left)/rect.width, cy=(e.clientY-rect.top)/rect.height
    const el = els.find(x=>x.id===id)!; setSel(id)
    dragRef.current = { id, offX: cx-el.x, offY: cy-el.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e:React.PointerEvent)=>{
    if(!dragRef.current) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const cx=(e.clientX-rect.left)/rect.width, cy=(e.clientY-rect.top)/rect.height
    setEls(p=>p.map(el=> el.id===dragRef.current!.id ? { ...el, x: clamp(cx-dragRef.current!.offX,0,1), y: clamp(cy-dragRef.current!.offY,0,1) } : el))
  }
  const endDrag = (e:React.PointerEvent)=>{ dragRef.current=null; try{(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)}catch{} }

  // === export ===
  const renderToDataURL = async (fmt:'png'|'jpeg')=>{
    const c=document.createElement('canvas'); c.width=CANVAS; c.height=CANVAS
    const ctx=c.getContext('2d')!
    const img=await loadImage(bg)
    const s=Math.max(CANVAS/img.width, CANVAS/img.height)
    const dw=img.width*s, dh=img.height*s
    ctx.drawImage(img,(CANVAS-dw)/2,(CANVAS-dh)/2,dw,dh)
    els.forEach(el=>{
      ctx.save()
      ctx.globalAlpha=el.opacity/100
      ctx.textAlign=el.align; ctx.textBaseline='middle'
      ctx.font=`bold ${el.fontSize}px 'Anton', Impact, system-ui, sans-serif`
      drawParagraph(ctx, el.text, el.align, el.color, el.strokeColor, el.strokeWidth, el.x*CANVAS, el.y*CANVAS, CANVAS-120, el.fontSize)
      ctx.restore()
    })
    return c.toDataURL(fmt==='png'?'image/png':'image/jpeg')
  }
  const onSave = async ()=>{ const url=await renderToDataURL(mime==='image/png'?'png':'jpeg'); const a=document.createElement('a'); a.href=url; a.download=`meme-${Date.now()}.${mime==='image/png'?'png':'jpg'}`; a.click() }
  const onShare = async ()=>{ const url=await renderToDataURL('png'); const blob=await (await fetch(url)).blob(); const file=new File([blob],'meme.png',{type:'image/png'}); if(navigator.canShare && navigator.canShare({files:[file]} as any)){ await navigator.share({files:[file] as any,title:'Retro Meme'}) } }

  const px = (v:number)=> Math.max(8, Math.round(v * (view/1080 || 0.5)))

  return (
    <>
      <AppTopBar title="Editor" onSave={onSave} onShare={onShare} />
      <main className="app-safe mx-auto max-w-xl px-3 space-y-4">
        {/* Preview */}
        <div
          ref={wrapRef}
          className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black"
          onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}
        >
          <img src={bg} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
          {els.map(el=>(
            <div
              key={el.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 select-none ${sel===el.id?'ring-2 ring-yellow-300 ring-offset-2 ring-offset-black rounded':''}`}
              style={{
                left:`${el.x*100}%`, top:`${el.y*100}%`,
                fontSize:`${px(el.fontSize)}px`, color:el.color, textAlign:el.align as any, lineHeight:1.1,
                textShadow: el.strokeWidth>0 ? `
                  -${px(el.strokeWidth)}px -${px(el.strokeWidth)}px 0 ${el.strokeColor},
                   ${px(el.strokeWidth)}px -${px(el.strokeWidth)}px 0 ${el.strokeColor},
                  -${px(el.strokeWidth)}px  ${px(el.strokeWidth)}px 0 ${el.strokeColor},
                   ${px(el.strokeWidth)}px  ${px(el.strokeWidth)}px 0 ${el.strokeColor}
                ` : 'none',
                opacity: el.opacity/100,
                fontWeight: 700
              }}
              onPointerDown={(e)=>startDrag(e, el.id)}
              onClick={(e)=>{ e.stopPropagation(); setSel(el.id) }}
            >
              {el.text}
              {sel===el.id && (
                <button
                  data-control
                  onPointerDown={(e)=>{ e.stopPropagation(); e.preventDefault() }}
                  onClick={(e)=>{ e.stopPropagation(); setEls(p=>p.filter(x=>x.id!==el.id)); setSel(null) }}
                  className="absolute -top-8 -right-8 z-10 w-8 h-8 rounded-full bg-red-600 text-white grid place-items-center shadow"
                  title="삭제"
                >×</button>
              )}
            </div>
          ))}
        </div>

        {/* Controls (간결 + 균형 크기) */}
        {selected && (
          <div className="retro-card space-y-3">
            <input className="input" value={selected.text} onChange={e=>setEls(p=>p.map(x=>x.id===sel?{...x,text:e.target.value}:x))}/>
            <div className="grid grid-cols-3 gap-2">
              <Range label="크기" value={selected.fontSize} min={24} max={160} onChange={v=>setEls(p=>p.map(x=>x.id===sel?{...x,fontSize:v}:x))}/>
              <Color label="색상" value={selected.color} onChange={v=>setEls(p=>p.map(x=>x.id===sel?{...x,color:v}:x))}/>
              <Color label="외곽선" value={selected.strokeColor} onChange={v=>setEls(p=>p.map(x=>x.id===sel?{...x,strokeColor:v}:x))}/>
              <Range label="외곽선" value={selected.strokeWidth} min={0} max={20} onChange={v=>setEls(p=>p.map(x=>x.id===sel?{...x,strokeWidth:v}:x))}/>
              <Range label="불투명도" value={selected.opacity} min={10} max={100} onChange={v=>setEls(p=>p.map(x=>x.id===sel?{...x,opacity:v}:x))}/>
              <div className="flex items-center gap-2 text-sm">
                <span>정렬</span>
                <button className="btn-outline" onClick={()=>setEls(p=>p.map(x=>x.id===sel?{...x,align:'left'}:x))}>좌</button>
                <button className="btn-outline" onClick={()=>setEls(p=>p.map(x=>x.id===sel?{...x,align:'center'}:x))}>중</button>
                <button className="btn-outline" onClick={()=>setEls(p=>p.map(x=>x.id===sel?{...x,align:'right'}:x))}>우</button>
              </div>
            </div>
          </div>
        )}

        {/* quick actions */}
        <div className="grid grid-cols-4 gap-2">
          <label className="btn-outline text-center cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files && setBg(URL.createObjectURL(e.target.files[0]))}/>
            배경
          </label>
          <button className="btn-outline" onClick={()=>{ const t=mkTop(); setEls(p=>[...p,t]); setSel(t.id) }}>+TOP</button>
          <button className="btn-outline" onClick={()=>{ const t=mkBottom(); setEls(p=>[...p,t]); setSel(t.id) }}>+BOTTOM</button>
          <button className="btn-outline" onClick={()=>{ const t=mkFree(); setEls(p=>[...p,t]); setSel(t.id) }}>+TEXT</button>
        </div>

        <div className="flex items-center gap-2">
          <select className="input" value={mime} onChange={e=>setMime(e.target.value as any)}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
          </select>
          <button className="btn ml-auto" onClick={onSave}>Export</button>
        </div>
      </main>
      <AppTabBar />
    </>
  )
}

/* ---------- small ui atoms ---------- */
function Range({ label, value, onChange, min, max, step=1 }:{
  label:string; value:number; onChange:(v:number)=>void; min:number; max:number; step?:number
}) {
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-white/70">{label} <span className="tabular-nums">{Math.round(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(Number(e.target.value))}/>
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

/* ---------- helpers ---------- */
function mkTop():TextEl{ return { id:uid(), text:'TOP TEXT', x:.5, y:.1, fontSize:96, color:'#fff', strokeColor:'#000', strokeWidth:8, align:'center', opacity:100 } }
function mkBottom():TextEl{ return { id:uid(), text:'BOTTOM TEXT', x:.5, y:.9, fontSize:96, color:'#fff', strokeColor:'#000', strokeWidth:8, align:'center', opacity:100 } }
function mkFree():TextEl{ return { id:uid(), text:'텍스트', x:.5, y:.5, fontSize:72, color:'#fff', strokeColor:'#000', strokeWidth:6, align:'center', opacity:100 } }
function loadImage(src:string){ return new Promise<HTMLImageElement>((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src }) }
function drawParagraph(ctx:CanvasRenderingContext2D, text:string, align:Align, fill:string, stroke:string, sw:number, cx:number, cy:number, maxW:number, sz:number){
  const words=text.split(/(\\s+)/); const lines:string[]=[]; let line=''
  for(const w of words){ const t=line+w; if(ctx.measureText(t).width>maxW && line.trim()!==''){ lines.push(line.trimEnd()); line=w.trimStart() } else line=t }
  if(line) lines.push(line.trimEnd())
  const lh=sz*1.1, start=cy-(lines.length-1)*lh/2
  for(let i=0;i<lines.length;i++){ ctx.lineWidth=sw; ctx.strokeStyle=stroke; ctx.fillStyle=fill; ctx.textAlign=align as any; ctx.strokeText(lines[i],cx,start+i*lh); ctx.fillText(lines[i],cx,start+i*lh) }
}