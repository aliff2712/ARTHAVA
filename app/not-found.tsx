import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground opacity-40" />
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground text-sm">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Button asChild>
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  )
}