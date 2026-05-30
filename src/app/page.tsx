import { Metadata } from 'next'
import StoreHomePageClient from './StoreHomePageClient'

export const metadata: Metadata = {
  title: 'GearZone - Phụ kiện gaming rõ giá, rõ tồn kho',
  description: 'GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng. Chúng tôi tập trung vào sản phẩm rõ thông tin, giá minh bạch, tồn kho thực và hỗ trợ nhanh cho game thủ.',
}

export default function StoreHomePage() {
  return <StoreHomePageClient />
}
