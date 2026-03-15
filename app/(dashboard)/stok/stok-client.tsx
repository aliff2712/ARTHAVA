'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Minus, PackageX } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Produk {
  id: string
  nama: string
  stok: number
  stok_minimum: number
  satuan: string
  kategori: { nama: string } | null
}

interface Props {
  produkList: Produk[] | undefined
  tokoId: string
}

export default function StokClient({ produkList = [], tokoId }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'semua' | 'menipis' | 'habis'>('semua')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Produk | null>(null)
  const [jumlah, setJumlah] = useState('')
  const [tipe, setTipe] = useState<'tambah' | 'kurangi'>('tambah')
  const [loading, setLoading] = useState(false)

  const filtered = produkList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase())
    if (filter === 'menipis') return matchSearch && p.stok <= p.stok_minimum && p.stok > 0
    if (filter === 'habis') return matchSearch && p.stok === 0
    return matchSearch
  })

  const handleOpenAdjust = (produk: Produk, t: 'tambah' | 'kurangi') => {
    setSelected(produk)
    setTipe(t)
    setJumlah('')
    setOpen(true)
  }

  const handleSimpan = async () => {
    if (!selected || !jumlah || parseInt(jumlah) <= 0) return
    setLoading(true)
    const supabase = createClient()

    const delta = tipe === 'tambah' ? parseInt(jumlah) : -parseInt(jumlah)
    const stokBaru = selected.stok + delta

    if (stokBaru < 0) {
      alert('Stok tidak bisa minus!')
      setLoading(false)
      return
    }

    await supabase
      .from('produk')
      .update({ stok: stokBaru, updated_at: new Date().toISOString() })
      .eq('id', selected.id)

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const getStokStatus = (p: Produk) => {
    if (p.stok === 0) return { label: 'Habis', class: 'bg-red-100 text-red-700' }
    if (p.stok <= p.stok_minimum) return { label: 'Menipis', class: 'bg-orange-100 text-orange-700' }
    return { label: 'Aman', class: 'bg-green-100 text-green-700' }
  }

  const counts = {
    semua: produkList.length,
    menipis: produkList.filter(p => p.stok <= p.stok_minimum && p.stok > 0).length,
    habis: produkList.filter(p => p.stok === 0).length,
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['semua', 'menipis', 'habis'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          className="pl-9"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {/* List stok */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageX className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Tidak ada produk</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((produk) => {
            const status = getStokStatus(produk)
            return (
              <Card key={produk.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{produk.nama}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {produk.kategori && (
                          <span className="text-xs text-muted-foreground">
                            {produk.kategori.nama}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Stok info */}
                    <div className="text-center shrink-0">
                      <p className="font-bold text-lg leading-none">{produk.stok}</p>
                      <p className="text-xs text-muted-foreground">{produk.satuan}</p>
                    </div>

                    {/* Tombol adjust */}
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleOpenAdjust(produk, 'tambah')}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleOpenAdjust(produk, 'kurangi')}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar stok */}
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          produk.stok === 0
                            ? 'bg-red-500'
                            : produk.stok <= produk.stok_minimum
                            ? 'bg-orange-400'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (produk.stok / (produk.stok_minimum * 3)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum: {produk.stok_minimum} {produk.satuan}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog adjust stok */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {tipe === 'tambah' ? 'Tambah Stok' : 'Kurangi Stok'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-sm">{selected.nama}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Stok saat ini:{' '}
                  <span className="font-bold text-slate-700">
                    {selected.stok} {selected.satuan}
                  </span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah {tipe === 'tambah' ? 'penambahan' : 'pengurangan'}</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Masukkan jumlah..."
                  value={jumlah}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJumlah(e.target.value)}
                />
                {jumlah && parseInt(jumlah) > 0 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    Stok setelah:{' '}
                    <span className="font-bold text-slate-700">
                      {tipe === 'tambah'
                        ? selected.stok + parseInt(jumlah)
                        : selected.stok - parseInt(jumlah)}{' '}
                      {selected.satuan}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSimpan}
                  disabled={loading || !jumlah || parseInt(jumlah) <= 0}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}