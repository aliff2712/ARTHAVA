'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
      <h1 className="font-semibold text-slate-800">{title}</h1>
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  )
}