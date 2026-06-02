'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Nếu là lỗi "Loading chunk failed" do hệ thống vừa deploy bản mới
    if (error.message.toLowerCase().includes('loading chunk') || error.message.toLowerCase().includes('fetch failed')) {
      const reloadKey = 'chunk_reload_prevent_loop_' + window.location.pathname
      // Chỉ auto-reload 1 lần để tránh lặp vô hạn
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, 'true')
        window.location.reload()
      } else {
        sessionStorage.removeItem(reloadKey)
      }
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="size-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <RotateCcw className="size-8" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-white">Đã xảy ra lỗi</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Hệ thống có thể vừa được cập nhật phiên bản mới. Vui lòng tải lại trang để làm mới dữ liệu và tiếp tục sử dụng.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 font-semibold transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
        >
          Tải lại trang ngay
        </button>

        <div className="mt-8 text-left border-t border-white/5 pt-6">
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">Chi tiết (Dành cho Dev):</p>
          <pre className="bg-black/50 p-4 rounded-xl text-xs text-slate-400 overflow-auto border border-white/5 whitespace-pre-wrap break-all max-h-32">
            {error.message}
          </pre>
        </div>
      </div>
    </div>
  )
}
