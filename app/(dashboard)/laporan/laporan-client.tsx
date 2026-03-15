'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Banknote, CalendarDays } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format, parseISO, startOfDay, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

interface Transaksi {
  id: string
  total: number
  created_at: string
  metode_bayar: string
  nomor_transaksi: string
}

interface Props {
  transaksiList: Transaksi[]
}

type Range = '7' | '30'

export default function LaporanClient({ transaksiList }: Props) {
  const [range, setRange] = useState<Range>('7')

  const today = startOfDay(new Date())
  const days = parseInt(range)

  const filtered = useMemo(() => {
    const batas = subDays(today, days - 1)
    return transaksiList.filter(t => new Date(t.created_at) >= batas)
  }, [transaksiList, range])

  // Buat data grafik per hari
  const chartData = useMemo(() => {
    const map: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const tgl = format(subDays(today, i), 'yyyy-MM-dd')
      map[tgl] = 0
    }
    filtered.forEach(t => {
      const tgl = t.created_at.split('T')[0]
      if (map[tgl] !== undefined) map[tgl] += t.total
    })
    return Object.entries(map).map(([date, total]) => ({
      date: format(parseISO(date), 'd MMM', { locale: id }),
      total,
    }))
  }, [filtered, range])

  const totalPendapatan = filtered.reduce((sum, t) => sum + t.total, 0)
  const jumlahTransaksi = filtered.length
  const rataHarian = jumlahTransaksi > 0 ? totalPendapatan / days : 0

  const stats = [
    {
      label: `Total ${days} hari`,
      value: formatRupiah(totalPendapatan),
      icon: Banknote,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Jumlah transaksi',
      value: `${jumlahTransaksi}x`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Rata-rata/hari',
      value: formatRupiah(rataHarian),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Hari dengan data',
      value: `${chartData.filter(d => d.total > 0).length} hari`,
      icon: CalendarDays,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Range selector */}
      <div className="flex gap-2">
        {(['7', '30'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === r
                ? 'bg-primary text-white'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r} hari terakhir
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-bold text-sm mt-0.5">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Grafik */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grafik penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
              />
             <Tooltip
                formatter={(value) => [formatRupiah(Number(value)), 'Penjualan']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Riwayat transaksi */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Riwayat transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada transaksi dalam periode ini
            </p>
          ) : (
            <div className="divide-y">
              {filtered.slice(0, 30).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t.nomor_transaksi}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(t.created_at), 'd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatRupiah(t.total)}</p>
                    <span className="text-xs text-muted-foreground capitalize">{t.metode_bayar}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}