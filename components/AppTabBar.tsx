'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/editor', label: 'Editor' },
  { href: '/presets', label: 'Presets' },
  { href: '/settings', label: 'Settings' },
]

export default function AppTabBar() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 h-[64px] bg-black/90 backdrop-blur border-t border-white/10">
      <div className="mx-auto max-w-xl h-full px-4 grid grid-cols-3">
        {tabs.map(t => {
          const active = path.startsWith(t.href)
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