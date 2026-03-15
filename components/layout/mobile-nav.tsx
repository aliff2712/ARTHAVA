'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Boxes } from 'lucide-react'

const menus = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Kasir',     href: '/kasir',     icon: ShoppingCart },
  { label: 'Produk',    href: '/produk',    icon: Package },
  { label: 'Stok',      href: '/stok',      icon: Boxes },
  { label: 'Laporan',   href: '/laporan',   icon: BarChart3 },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex">
        {menus.map((menu) => {
          const Icon = menu.icon
          const active = pathname === menu.href || pathname.startsWith(menu.href + '/')
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 gap-1 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-slate-400'
              )}
            >
              <Icon className="h-5 w-5" />
              {menu.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}