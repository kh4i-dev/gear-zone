"use client"
import { useState } from 'react'

export function ProductDetailsTabs({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description')

  // Dữ liệu mẫu (sau này có thể lấy từ Database nếu thêm cột specifications)
  const mockSpecs = [
    { label: 'Thương hiệu', value: 'Đang cập nhật' },
    { label: 'Bảo hành', value: '12 - 24 tháng' },
    { label: 'Tình trạng', value: 'Mới 100%' },
    { label: 'Mã sản phẩm', value: product.id.slice(-8).toUpperCase() },
  ]

  return (
    <div className="mt-8 bg-slate-900/40 border border-white/5 p-6 lg:p-12 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-8 border-b border-white/10 mb-8">
        <button type="button" 
          onClick={() => setActiveTab('description')}
          className={`pb-4 text-xl font-extrabold tracking-tight transition-colors relative ${activeTab === 'description' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Bài viết đánh giá
          {activeTab === 'description' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button type="button" 
          onClick={() => setActiveTab('specs')}
          className={`pb-4 text-xl font-extrabold tracking-tight transition-colors relative ${activeTab === 'specs' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Thông số kỹ thuật
          {activeTab === 'specs' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {activeTab === 'description' && (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-indigo-400 prose-img:rounded-2xl prose-img:mx-auto prose-img:shadow-2xl">
          {product.description ? (
            // Using dangerouslySetInnerHTML allows rendering HTML (images, bold, etc.) from an Admin WYSIWYG editor
            <div {...{ dangerouslySetInnerHTML: { __html: product.description } }} className="leading-relaxed" />
          ) : (
            <p className="text-slate-500 italic">
              Chưa có bài viết đánh giá chi tiết cho sản phẩm này.
            </p>
          )}
        </div>
      )}

      {activeTab === 'specs' && (
        <div className="max-w-3xl">
          <table className="w-full text-left text-sm text-slate-300 border-collapse rounded-xl overflow-hidden shadow-lg border border-white/5">
            <tbody>
              {mockSpecs.map((spec) => (
                <tr key={spec.label} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <th className="py-4 px-6 font-semibold text-slate-400 w-1/3 bg-slate-950/50">{spec.label}</th>
                  <td className="py-4 px-6 font-medium text-white bg-slate-900/20">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-4 italic">* Thông số kỹ thuật mang tính tham khảo và có thể thay đổi mà không báo trước.</p>
        </div>
      )}
    </div>
  )
}
