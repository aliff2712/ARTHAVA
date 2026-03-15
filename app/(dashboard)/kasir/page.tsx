import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import KasirClient from './kasir-client'

export default async function KasirPage() {
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
    .gt('stok', 0)
    .order('nama')

  return (
    <div className="h-screen flex flex-col">
      <Topbar title="Kasir" />
      <KasirClient
        produkList={produkList ?? []}
        tokoId={profile?.toko_id ?? ''}
        kasirId={user!.id}
      />
    </div>
  )
}