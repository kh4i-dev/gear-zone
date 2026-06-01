"use client"
import { useState } from 'react'
import { X, ShieldCheck, Cpu, Truck, Star } from 'lucide-react'
import Image from 'next/image'

function inlineParse(text: string): string {
  let res = text
  
  // 1. Images: ![alt](url) -> <img src="$2" alt="$1" class="rounded-2xl mx-auto my-6 border border-white/10 shadow-2xl max-w-full" />
  res = res.replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl mx-auto my-6 border border-white/10 shadow-2xl max-w-full" />')

  // 2. Links: [text](url) -> <a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline font-semibold">$1</a>
  res = res.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline font-semibold">$1</a>')

  // 3. Bold: **text** -> <strong>text</strong>
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  res = res.replace(/__([^_]+)__/g, '<strong class="font-bold text-white">$1</strong>')

  // 4. Italic: *text* -> <em>text</em>
  res = res.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>')
  res = res.replace(/_([^_]+)_/g, '<em class="italic text-slate-300">$1</em>')
  
  // Support inline line breaks with single newlines
  res = res.replace(/\n/g, '<br />')

  return res
}

function parseMarkdown(md: string): string {
  if (!md) return ''
  
  // Normalize newlines
  const src = md.replace(/\r\n/g, '\n')
  
  // Split blocks by double newline or more
  const blocks = src.split(/\n\n+/)
  
  const parsedBlocks = blocks.map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ''
    
    // Check if it is a heading
    if (trimmed.startsWith('# ')) {
      return `<h1 class="text-2xl font-extrabold mt-6 mb-4 text-white">${trimmed.replace(/^#\s+/, '')}</h1>`
    }
    if (trimmed.startsWith('## ')) {
      return `<h2 class="text-xl font-bold mt-5 mb-3 text-white">${trimmed.replace(/^##\s+/, '')}</h2>`
    }
    if (trimmed.startsWith('### ')) {
      return `<h3 class="text-lg font-bold mt-4 mb-2 text-white">${trimmed.replace(/^###\s+/, '')}</h3>`
    }
    
    // Check if it is a list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
      const items = trimmed.split(/\n\s*[-*+]\s+/).map((item, idx) => {
        let text = item
        if (idx === 0) {
          text = item.replace(/^[-*+]\s+/, '')
        }
        return `<li class="text-slate-300 leading-relaxed">${inlineParse(text)}</li>`
      }).join('')
      return `<ul class="list-disc pl-5 my-4 space-y-2">${items}</ul>`
    }
    
    // Default: paragraph
    return `<p class="leading-relaxed text-justify text-slate-300 my-4">${inlineParse(trimmed)}</p>`
  })
  
  return parsedBlocks.filter(Boolean).join('\n')
}

export function ProductSpecsAndDesc({ product, shopName = 'GearZone' }: { product: any; shopName?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSpecsModal, setShowSpecsModal] = useState(false)

  const rawDescription = product.description || ''
  let displayDescription = rawDescription
  const customSpecs: { label: string; value: string }[] = []

  if (rawDescription.includes('$$$SPECS$$$')) {
    const [descPart, specsPart] = rawDescription.split('$$$SPECS$$$')
    displayDescription = descPart.trim()
    if (specsPart) {
      const lines = specsPart.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        const match = trimmed.match(/^([^:\t|=]+?)[:\t|=](.+)$/) || trimmed.match(/^(.+?)\s{2,}(.+)$/)
        let label = ''
        let value = ''
        if (match) {
          label = match[1]?.trim() || ''
          value = match[2]?.trim() || ''
        } else {
          const parts = trimmed.split(':')
          label = parts[0]?.trim() || ''
          value = parts.slice(1).join(':')?.trim() || ''
        }
        if (label && value) {
          customSpecs.push({ label, value })
        }
      }
    }
  }

  // Add new JSON specs format
  if (Array.isArray(product.specs)) {
    product.specs.forEach((s: any) => {
      if (s.name && s.value && s.name !== 'SummarySpec') {
        customSpecs.push({ label: s.name, value: s.value })
      }
    })
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(displayDescription)
  const parsedDescription = isHtml ? displayDescription : parseMarkdown(displayDescription)

  // Determine if we should show the read more / collapse logic based on description length
  const isLongDescription = displayDescription.length > 800 || parsedDescription.length > 1000

  // Blended specs list for the right sidebar card
  const summarySpecs = [
    { label: 'Mã sản phẩm', value: product.id.slice(-8).toUpperCase() },
    { label: 'Danh mục', value: product.category?.name || 'Đang cập nhật' },
    { label: 'Tình trạng', value: product.stock > 0 ? 'Còn hàng' : 'Tạm hết hàng' },
    { label: 'Đã bán', value: `${product.soldCount} sản phẩm` },
    ...customSpecs.slice(0, 3) // Show first 3 custom specs
  ]

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      {/* LEFT: Description (66% width) */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-3xl backdrop-blur-md relative flex flex-col">
        <h2 className="text-xl font-semibold tracking-tight text-white mb-6 pb-4 border-b border-white/5">
          Thông tin sản phẩm
        </h2>
        
        <div className={`prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-p:text-justify prose-headings:text-white prose-a:text-indigo-400 prose-img:rounded-2xl prose-img:mx-auto prose-img:my-6 prose-img:shadow-2xl overflow-hidden transition-all duration-500 relative ${isLongDescription && !isExpanded ? 'max-h-[500px]' : ''}`}>
          {displayDescription ? (
            <div className="space-y-4">
              <div 
                {...{ dangerouslySetInnerHTML: { __html: parsedDescription } }} 
                className={`leading-relaxed text-justify prose-p:text-justify ${!/<[a-z][\s\S]*>/i.test(displayDescription) ? 'whitespace-pre-line' : ''}`} 
              />
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-slate-500 text-sm">Chưa có bài viết mô tả chi tiết cho sản phẩm này.</p>
            </div>
          )}

          {/* Fade overlay when collapsed */}
          {isLongDescription && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Premium Store Benefits Grid */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-5 flex items-center gap-2">
            <span className="size-1.5 bg-indigo-400 rounded-full animate-ping"></span>
            Đặc quyền mua hàng tại {shopName}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-950/60 transition-all duration-300 group flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Giao hàng hoả tốc 2h</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Miễn phí vận chuyển nội thành Hà Nội & TP.HCM, nhận sản phẩm ngay sau 2 giờ đặt mua.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-950/60 transition-all duration-300 group flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Chính hãng 100%</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Đầy đủ tem mác chính ngạch, cam kết bảo hành lỗi 1 đổi 1 tận nơi trong 12 tháng đầu.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-amber-500/20 hover:bg-slate-950/60 transition-all duration-300 group flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                <Star className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Đổi trả VIP 30 ngày</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Khách hàng được hỗ trợ đổi mới thiết bị cực kỳ nhanh chóng nếu phát hiện lỗi kỹ thuật.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-purple-500/20 hover:bg-slate-950/60 transition-all duration-300 group flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                <Cpu className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Hỗ trợ setup trọn đời</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Đội ngũ kỹ sư công nghệ sẵn sàng tư vấn cấu hình, tối ưu hóa phần mềm góc máy 24/7.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Read More button */}
        {isLongDescription && (
          <button type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 mx-auto bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold px-6 py-2.5 rounded-xl border border-indigo-500/20 transition-all text-sm flex items-center gap-2"
          >
            {isExpanded ? 'Thu gọn bài viết ▲' : 'Đọc tiếp bài viết ▼'}
          </button>
        )}
      </div>

      {/* RIGHT: Specs Table (33% width) */}
      <div className="bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-3xl backdrop-blur-md h-fit">
        <h2 className="text-xl font-semibold tracking-tight text-white mb-6 pb-4 border-b border-white/5">
          Thông số kỹ thuật
        </h2>
        
        <table className="w-full text-left text-sm text-slate-300 border-collapse rounded-xl overflow-hidden border border-white/5">
          <tbody>
            {summarySpecs.map((spec) => (
              <tr key={spec.label} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <th className="py-3.5 px-4 font-semibold text-slate-400 w-1/3 bg-slate-950/50 text-xs">{spec.label}</th>
                <td className="py-3.5 px-4 font-medium text-white bg-slate-900/20 text-xs">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button type="button" 
          onClick={() => setShowSpecsModal(true)}
          className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-2"
        >
          <Cpu className="size-3.5 text-blue-400" />
          Xem cấu hình chi tiết ➔
        </button>
      </div>

      {/* DETAILED SPECIFICATIONS MODAL */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Cpu className="size-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Cấu hình chi tiết</h3>
                  <p className="text-xs text-slate-400">{product.name}</p>
                </div>
              </div>
              <button type="button" 
                onClick={() => setShowSpecsModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <table className="w-full text-left text-sm text-slate-300 border-collapse rounded-2xl overflow-hidden border border-white/5">
                <tbody>
                  {/* Base specifications */}
                  <tr className="border-b border-white/5 bg-slate-950/40">
                    <th className="py-3 px-4 font-bold text-blue-400 text-xs uppercase tracking-wider" colSpan={2}>
                      Thông số cơ bản
                    </th>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                    <th className="py-3 px-4 font-semibold text-slate-400 w-1/3 text-xs">Mã sản phẩm</th>
                    <td className="py-3 px-4 font-medium text-white text-xs">{product.id.toUpperCase()}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                    <th className="py-3 px-4 font-semibold text-slate-400 text-xs">Danh mục</th>
                    <td className="py-3 px-4 font-medium text-white text-xs">{product.category?.name || 'Đang cập nhật'}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                    <th className="py-3 px-4 font-semibold text-slate-400 text-xs">Tình trạng</th>
                    <td className="py-3 px-4 font-medium text-white text-xs">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                    <th className="py-3 px-4 font-semibold text-slate-400 text-xs">Đã bán</th>
                    <td className="py-3 px-4 font-medium text-white text-xs">{product.soldCount} sản phẩm</td>
                  </tr>

                  {/* Custom specifications */}
                  {customSpecs.length > 0 ? (
                    <>
                      <tr className="border-b border-white/5 bg-slate-950/40">
                        <th className="py-3 px-4 font-bold text-blue-400 text-xs uppercase tracking-wider" colSpan={2}>
                          Thông số kỹ thuật
                        </th>
                      </tr>
                      {customSpecs.map((spec) => (
                        <tr key={spec.label} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                          <th className="py-3 px-4 font-semibold text-slate-400 w-1/3 text-xs">{spec.label}</th>
                          <td className="py-3 px-4 font-medium text-white text-xs">{spec.value}</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr className="last:border-0">
                      <td className="py-6 px-4 text-center text-xs text-slate-500 italic" colSpan={2}>
                        Chưa có thông số kỹ thuật chi tiết khác cho sản phẩm này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Genuine GearZone tag */}
              <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl">
                <ShieldCheck className="size-5 text-indigo-400 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  Thông số kỹ thuật được kiểm duyệt chính xác bởi đội ngũ kỹ thuật viên của <strong>{shopName}</strong>. Bảo hành chính hãng 100%.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 flex justify-end mt-4">
              <button type="button" 
                onClick={() => setShowSpecsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
