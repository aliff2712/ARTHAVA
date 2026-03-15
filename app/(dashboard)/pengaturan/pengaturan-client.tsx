'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Store, User, Loader2 } from 'lucide-react'

interface Props {
  profile: any
}

export default function PengaturanClient({ profile }: Props) {
  const router = useRouter()
  const [loadingToko, setLoadingToko] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [formToko, setFormToko] = useState({
    nama_toko: profile?.toko?.nama_toko ?? '',
    alamat: profile?.toko?.alamat ?? '',
    telepon: profile?.toko?.telepon ?? '',
  })

  const [formProfile, setFormProfile] = useState({
    nama_lengkap: profile?.nama_lengkap ?? '',
  })

  const handleSimpanToko = async () => {
    setLoadingToko(true)
    const supabase = createClient()
    await supabase
      .from('toko')
      .update(formToko)
      .eq('id', profile?.toko_id)
    setLoadingToko(false)
    setSuccessMsg('Data toko berhasil disimpan')
    setTimeout(() => setSuccessMsg(''), 3000)
    router.refresh()
  }

  const handleSimpanProfile = async () => {
    setLoadingProfile(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ nama_lengkap: formProfile.nama_lengkap })
      .eq('id', profile?.id)
    setLoadingProfile(false)
    setSuccessMsg('Profil berhasil disimpan')
    setTimeout(() => setSuccessMsg(''), 3000)
    router.refresh()
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl">
      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
          ✓ {successMsg}
        </div>
      )}

      {/* Info toko */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Store className="h-4 w-4" /> Informasi toko
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama toko</Label>
            <Input
              value={formToko.nama_toko}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormToko({ ...formToko, nama_toko: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Alamat</Label>
            <Input
              placeholder="Jl. Contoh No. 1"
              value={formToko.alamat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormToko({ ...formToko, alamat: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nomor telepon</Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={formToko.telepon}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormToko({ ...formToko, telepon: e.target.value })}
            />
          </div>
          <Button onClick={handleSimpanToko} disabled={loadingToko} className="w-full">
            {loadingToko ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan data toko'}
          </Button>
        </CardContent>
      </Card>

      {/* Info profil */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" /> Profil pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama lengkap</Label>
            <Input
              value={formProfile.nama_lengkap}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormProfile({ ...formProfile, nama_lengkap: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile?.toko?.owner_id ?? ''} disabled className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
          </div>
          <Button onClick={handleSimpanProfile} disabled={loadingProfile} className="w-full">
            {loadingProfile ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan profil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}