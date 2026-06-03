import { LayoutGrid } from 'lucide-react'
import { CategoryCard, type CategoryData } from './CategoryCard'

interface HomeCategorySectionProps {
  categories: CategoryData[]
}

export function HomeCategorySection({ categories }: HomeCategorySectionProps) {
  if (categories.length === 0) return null

  return (
    <section id="home-categories" className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <div className="mb-6 md:mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center justify-center gap-3">
          <LayoutGrid className="size-5 md:size-6 text-emerald-400" />
          Khám phá danh mục
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          Tìm nhanh thiết bị gaming phù hợp với nhu cầu của bạn.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  )
}
