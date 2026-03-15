'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nama: '', namaToko: '', email: '', password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Daftarkan user
   const { data, error: signUpError } = await supabase.auth.signUp({
  email: form.email,
  password: form.password,
  options: { data: { nama_lengkap: form.nama } }
})

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Pendaftaran gagal.')
      setLoading(false)
      return
    }

    // Pastikan session aktif sebelum insert
    if (!data.session) {
      setError('Silakan cek email kamu untuk konfirmasi akun terlebih dahulu.')
      setLoading(false)
      return
    }

    // 2. Buat data toko
    const { data: toko, error: tokoError } = await supabase
      .from('toko')
      .insert({ nama_toko: form.namaToko, owner_id: data.user.id })
      .select()
      .single()

    if (tokoError || !toko) {
      setError('Gagal membuat data toko.')
      setLoading(false)
      return
    }

    // 3. Update profile dengan toko_id & role admin
    await supabase
      .from('profiles')
      .update({ toko_id: toko.id, role: 'admin' })
      .eq('id', data.user.id)

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-2xl p-3 mb-3">
            <ShoppingCart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">KasirKu</h1>
          <p className="text-muted-foreground text-sm">Daftar dan mulai kelola toko kamu</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buat akun baru</CardTitle>
            <CardDescription>Gratis selamanya untuk UMKM kecil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama lengkap</Label>
                <Input id="nama" name="nama" placeholder="Budi Santoso"
                  value={form.nama} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="namaToko">Nama toko</Label>
                <Input id="namaToko" name="namaToko" placeholder="Warung Berkah"
                  value={form.namaToko} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="contoh@email.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Minimal 8 karakter"
                  value={form.password} onChange={handleChange} minLength={8} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuat akun...</>
                ) : 'Daftar sekarang'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}