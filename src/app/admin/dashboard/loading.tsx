import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="size-8 animate-spin text-blue-400" />
    </div>
  )
}
