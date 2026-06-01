import { Metadata } from 'next'
import RegisterClient from './RegisterClient'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản để bắt đầu hành trình mua sắm gaming gear.',
}

export default async function RegisterPage() {
  const { shopName } = await getSiteSettings()
  return <RegisterClient shopName={shopName} />
}
