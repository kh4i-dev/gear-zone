import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Đăng nhập - GearZone',
  description: 'Đăng nhập tài khoản GearZone để trải nghiệm mua sắm tốt nhất.',
}

export default function LoginPage() {
  return <LoginClient />
}
