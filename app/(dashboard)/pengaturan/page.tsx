import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/topbar'
import PengaturanClient from './pengaturan-client'

export default async function PengaturanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, toko(*)')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <Topbar title="Pengaturan" />
      <PengaturanClient profile={profile} />
    </div>
  )
}