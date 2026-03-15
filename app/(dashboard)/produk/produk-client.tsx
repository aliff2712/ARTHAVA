'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, PackageX } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Produk {
  id: string
  nama: string
  harga: number
  harga_modal: number
  stok: number
  stok_minimum: number
  satuan: string
  kategori_id: string | null
  kategori: { nama: string } | null
}

interface Kategori {
  id: string
  nama: string
}

interface Props {
  produkList: Produk[]
  kategoriList: Kategori[]
  tokoId: string
}

const emptyForm = {
  nama: '', harga: '', harga_modal: '', stok: '',
  stok_minimum: '5', satuan: 'pcs', kategori_id: ''
}

export default function ProdukClient({ produkList, kategoriList, tokoId }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = produkList.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpen = (produk?: Produk) => {
    if (produk) {
      setEditId(produk.id)
      setForm({
        nama: produk.nama,
        harga: String(produk.harga),
        harga_modal: String(produk.harga_modal),
        stok: String(produk.stok),
        stok_minimum: String(produk.stok_minimum),
        satuan: produk.satuan,
        kategori_id: produk.kategori_id ?? ''
      })
    } else {
      setEditId(null)
      setForm(emptyForm)
    }
    setOpen(true)
  }

  const handleSimpan = async () => {
    if (!form.nama || !form.harga) return
    setLoading(true)
    const supabase = createClient()

    const payload = {
      nama: form.nama,
      harga: parseInt(form.harga),
      harga_modal: parseInt(form.harga_modal || '0'),
      stok: parseInt(form.stok || '0'),
      stok_minimum: parseInt(form.stok_minimum || '5'),
      satuan: form.satuan,
      kategori_id: form.kategori_id || null,
      toko_id: tokoId,
    }

    if (editId) {
      await supabase.from('produk').update(payload).eq('id', editId)
    } else {
      await supabase.from('produk').insert(payload)
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const handleHapus = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    const supabase = createClient()
    await supabase.from('produk').update({ aktif: false }).eq('id', id)
    router.refresh()
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            className="pl-9"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </div>

      {/* List produk */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageX className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((produk) => (
            <Card key={produk.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{produk.nama}</p>
                    {produk.kategori && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {produk.kategori.nama}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => handleOpen(produk)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => handleHapus(produk.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-bold text-primary">{formatRupiah(produk.harga)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Stok</span>
                  <span className={`text-xs font-medium ${produk.stok <= produk.stok_minimum ? 'text-orange-600' : 'text-green-600'}`}>
                    {produk.stok} {produk.satuan}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog tambah/edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit produk' : 'Tambah produk baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>Nama produk</Label>
              <Input placeholder="Contoh: Nasi Goreng"
                value={form.nama}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Harga jual (Rp)</Label>
                <Input type="number" placeholder="15000"
                  value={form.harga}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, harga: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Harga modal (Rp)</Label>
                <Input type="number" placeholder="10000"
                  value={form.harga_modal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, harga_modal: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Stok awal</Label>
                <Input type="number" placeholder="50"
                  value={form.stok}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, stok: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Satuan</Label>
                <Input placeholder="pcs / kg / liter"
                  value={form.satuan}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, satuan: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori_id}
                onValueChange={(v) => setForm({ ...form, kategori_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSimpan} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}