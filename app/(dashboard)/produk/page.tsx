import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import ProdukClient from './produk-client'

export default async function ProdukPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('toko_id')
    .eq('id', user!.id)
    .single()

  const { data: produkList } = await supabase
    .from('produk')
    .select('*, kategori(nama)')
    .eq('toko_id', profile?.toko_id)
    .eq('aktif', true)
    .order('nama')

  const { data: kategoriList } = await supabase
    .from('kategori')
    .select('*')
    .eq('toko_id', profile?.toko_id)
    .order('nama')

  return (
    <div>
      <Topbar title="Produk" />
      <ProdukClient
        produkList={produkList ?? []}
        kategoriList={kategoriList ?? []}
        tokoId={profile?.toko_id ?? ''}
      />
    </div>
  )
}