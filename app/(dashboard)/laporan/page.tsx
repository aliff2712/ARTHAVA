import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import LaporanClient from './laporan-client'

export default async function LaporanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('toko_id')
    .eq('id', user!.id)
    .single()

  // 30 hari terakhir
  const tgl30HariLalu = new Date()
  tgl30HariLalu.setDate(tgl30HariLalu.getDate() - 30)

  const { data: transaksiList } = await supabase
    .from('transaksi')
    .select('id, total, created_at, metode_bayar, nomor_transaksi')
    .eq('toko_id', profile?.toko_id)
    .gte('created_at', tgl30HariLalu.toISOString())
    .order('created_at', { ascending: false })

  return (
    <div>
      <Topbar title="Laporan" />
      <LaporanClient transaksiList={transaksiList ?? []} />
    </div>
  )
}