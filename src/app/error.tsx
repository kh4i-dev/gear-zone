'use client'

export default function Error({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Lỗi</h1>
        <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto">
          {error.message}
        </pre>
      </div>
    </div>
  )
}
