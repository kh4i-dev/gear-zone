'use client'
import { useState } from 'react'
import { Star, Trash2, Plus, Award, Zap, Headset, Globe, ShieldCheck, Truck, RotateCcw, Cpu, Gamepad2 } from 'lucide-react'
import { Button, Input } from '@/components/domain/ui'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

export function FeaturesAdmin({ features, onUpdate }: { features: any[], onUpdate: () => void }) {
  const [icon, setIcon] = useState('Award')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon, title, description, isActive: true, sortOrder: features.length })
      })
      if (!res.ok) throw new Error()
      toast.success('Đã thêm tính năng')
      setTitle('')
      setDescription('')
      onUpdate()
    } catch {
      toast.error('Lỗi khi thêm tính năng')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return
    try {
      const res = await fetch(`/api/admin/features/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Đã xóa tính năng')
      onUpdate()
    } catch {
      toast.error('Lỗi khi xóa tính năng')
    }
  }

  const PRESET_ICONS = ['Award', 'Zap', 'Headset', 'Globe', 'ShieldCheck', 'Truck', 'RotateCcw', 'Cpu', 'Gamepad2']

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Plus className="size-5 text-indigo-400" />
          Thêm Tính năng mới
        </h3>
        
        <div>
          <p className="block text-sm font-semibold mb-2">Icon</p>
          <div className="flex gap-2 flex-wrap mb-2">
            {PRESET_ICONS.map(i => {
              const IconComp = (LucideIcons as any)[i] || Award
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-xl border transition-all ${icon === i ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-white/10 hover:bg-white/10'}`}
                >
                  <IconComp className="size-5" />
                </button>
              )
            })}
          </div>
          <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Tên icon Lucide (vd: Award)" className="bg-slate-900 border-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="block text-sm font-semibold mb-2">Tiêu đề</p>
            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="VD: Chính hãng 100%" className="bg-slate-900 border-white/10" />
          </div>
          <div>
            <p className="block text-sm font-semibold mb-2">Mô tả</p>
            <Input value={description} onChange={e => setDescription(e.target.value)} required placeholder="Mô tả ngắn gọn" className="bg-slate-900 border-white/10" />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700">Thêm Tính Năng</Button>
      </form>

      <div className="space-y-3">
        {features.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-4">Chưa có tính năng nào. Sẽ dùng dữ liệu mặc định trên UI.</p>
        )}
        {features.map((f: any) => {
          const IconComp = (LucideIcons as any)[f.icon] || Award
          return (
            <div key={f.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <IconComp className="size-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{f.title}</h4>
                  <p className="text-sm text-slate-400">{f.description}</p>
                </div>
              </div>
              <button type="button" onClick={() => handleDelete(f.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="size-5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
