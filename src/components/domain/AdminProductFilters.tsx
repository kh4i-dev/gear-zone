import { ListFilter, Boxes, Search } from 'lucide-react'

interface AdminProductFiltersProps {
  products: any[]
  categoryStats: { id: string; name: string; count: number }[]
  brandStats: Record<string, number>
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  selectedBrand: string
  setSelectedBrand: (val: string) => void
  filterTab: string
  setFilterTab: (val: any) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
}

export function AdminProductFilters({
  products,
  categoryStats,
  brandStats,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
}: AdminProductFiltersProps) {
  return (
    <>
      {/* Category Filter Section */}
      <div className="mb-4 p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] shadow-xl">
        <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none">
            <ListFilter className="size-4 text-blue-400 animate-pulse" />
            Khu vực quản lý sản phẩm
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                {products.length}
              </span>
            </button>

            {categoryStats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Filter Section */}
      <div className="mb-6 p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] shadow-xl">
        <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none">
            <Boxes className="size-4 text-blue-400 animate-pulse" />
            Lọc theo thương hiệu
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                selectedBrand === 'all'
                  ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span>Tất cả hãng</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                {Object.keys(brandStats).length}
              </span>
            </button>

            {Object.entries(brandStats).map(([brand, count]) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                  selectedBrand === brand
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                }`}
              >
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>{brand}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-xl whitespace-nowrap w-max">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đang bán' },
              { id: 'hidden', label: 'Ẩn' },
              { id: 'out_of_stock', label: 'Hết hàng' },
              { id: 'discontinued', label: 'Ngừng kinh doanh' },
              { id: 'draft', label: 'Bản nháp' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="Tên, danh mục hoặc SKU..."
            aria-label="Tìm kiếm sản phẩm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>
    </>
  )
}
