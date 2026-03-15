'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'kasirku-pwa-dismissed'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Cek apakah sudah diinstall (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Cek apakah user sudah dismiss sebelumnya
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) return

    // Deteksi iOS
    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !(window as any).MSStream
    setIsIOS(ios)

    // Kalau iOS, tampilkan panduan manual
    if (ios) {
      setTimeout(() => setShow(true), 3000)
      return
    }

    // Android/Desktop — pakai beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    // Jangan tampilkan lagi selama 7 hari
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISSED_KEY, String(expiry))
  }

  // Cek apakah dismiss sudah expired
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed && Date.now() > parseInt(dismissed)) {
      localStorage.removeItem(DISMISSED_KEY)
    }
  }, [])

  if (!show || isInstalled) return null

  // Tampilan khusus iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50">
        <div className="bg-white border rounded-xl shadow-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-lg p-2">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-sm">Install KasirKu</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Untuk install di iPhone/iPad:
          </p>
          <ol className="text-xs text-muted-foreground mt-2 space-y-1.5 list-none">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              Tap ikon <strong className="text-slate-700 mx-1">Bagikan</strong> di bawah browser
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              Pilih <strong className="text-slate-700 mx-1">"Tambahkan ke Layar Utama"</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
              Tap <strong className="text-slate-700 mx-1">"Tambah"</strong> di pojok kanan atas
            </li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 h-8 text-xs"
            onClick={handleDismiss}
          >
            Mengerti
          </Button>
        </div>
      </div>
    )
  }

  // Tampilan Android / Desktop
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50">
      <div className="bg-white border rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="bg-primary/10 rounded-lg p-2 shrink-0">
          <Download className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install KasirKu</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Pasang di HP untuk akses lebih cepat tanpa buka browser
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleInstall}
            >
              Install sekarang
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleDismiss}
            >
              Nanti
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}