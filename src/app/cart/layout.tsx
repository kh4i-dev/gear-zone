import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giỏ hàng',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
