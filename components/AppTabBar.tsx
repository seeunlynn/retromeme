'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
]

export default function AppTabBar() {
  const path = usePathname()
  // 루트 페이지에서만 표시 (/ 또는 /browse)
  const show =
    path === '/' ||
    path === '/browse' ||
    // 쿼리만 다른 동일 경로 대비
    path.startsWith('/?') ||
    path.startsWith('/browse?')

  if (!show) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 h-[64px] bg-black/90 backdrop-blur border-t border-white/10">
      <div className="mx-auto max-w-xl h-full px-4 grid grid-cols-2">
        {tabs.map(t => {
          const active = path === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center justify-center text-sm ${active ? 'text-yellow-300' : 'text-white/70'}`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}