import Sidebar from '@/components/layout/sidebar'
import MobileNav from '@/components/layout/mobile-nav'
import PWAInstallPrompt from '@/components/pwa-install-prompt'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
      <PWAInstallPrompt />
    </div>
  )
}