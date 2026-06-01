import { Metadata } from 'next'
import LoginClient from './LoginClient'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản để trải nghiệm mua sắm tốt nhất.',
}

export default async function LoginPage() {
  const { shopName } = await getSiteSettings()
  return <LoginClient shopName={shopName} />
}
