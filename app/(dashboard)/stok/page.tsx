import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import StokClient from './stok-client'

export default async function StokPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('toko_id')
    .eq('id', user.id)
    .single()

  if (!profile?.toko_id) {
    return (
      <div>
        <Topbar title="Manajemen Stok" />
        <div className="p-6 text-sm text-muted-foreground">
          Data toko tidak ditemukan.
        </div>
      </div>
    )
  }

  const { data: produkList } = await supabase
    .from('produk')
    .select(`
      id,
      nama,
      stok,
      stok_minimum,
      satuan,
      kategori (
        nama
      )
    `)
    .eq('toko_id', profile.toko_id)
    .eq('aktif', true)
    .order('stok', { ascending: true })

  return (
    <div>
      <Topbar title="Manajemen Stok" />
      <StokClient
        produkList={(produkList ?? []) as any[]}
        tokoId={profile.toko_id}
      />
    </div>
  )
}