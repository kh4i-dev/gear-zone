import { Metadata } from 'next'
import { StoreNavbar } from '@/components/domain/StoreNavbar'

export const metadata: Metadata = {
  title: 'Danh sách sản phẩm',
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreNavbar />
      {children}
    </>
  )
}
