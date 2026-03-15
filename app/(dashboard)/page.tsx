import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil profile & toko
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, toko(*)')
    .eq('id', user!.id)
    .single()

  const tokoId = profile?.toko_id

  // Transaksi hari ini
  const today = new Date().toISOString().split('T')[0]
  const { data: transaksiHariIni } = await supabase
    .from('transaksi')
    .select('total')
    .eq('toko_id', tokoId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)

  const totalHariIni = transaksiHariIni?.reduce((sum, t) => sum + t.total, 0) ?? 0
  const jumlahTransaksi = transaksiHariIni?.length ?? 0

  // Total produk
  const { count: totalProduk } = await supabase
    .from('produk')
    .select('*', { count: 'exact', head: true })
    .eq('toko_id', tokoId)
    .eq('aktif', true)

  // Stok menipis
  const { data: stokMenipis } = await supabase
    .from('produk')
    .select('id, nama, stok, stok_minimum')
    .eq('toko_id', tokoId)
    .eq('aktif', true)
    .filter('stok', 'lte', 'stok_minimum')
    .limit(5)

  const stats = [
    {
      label: 'Penjualan hari ini',
      value: formatRupiah(totalHariIni),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Transaksi hari ini',
      value: `${jumlahTransaksi} transaksi`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total produk aktif',
      value: `${totalProduk ?? 0} produk`,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Stok menipis',
      value: `${stokMenipis?.length ?? 0} produk`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div>
      <Topbar title={`Selamat datang, ${profile?.nama_lengkap?.split(' ')[0] ?? 'Kak'} 👋`} />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4">
                  <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-sm md:text-base mt-0.5">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stok menipis */}
        {stokMenipis && stokMenipis.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Produk stok menipis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stokMenipis.map((produk) => (
                  <div key={produk.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm">{produk.nama}</span>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Sisa {produk.stok}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}