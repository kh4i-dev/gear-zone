import { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Đăng ký - GearZone',
  description: 'Tạo tài khoản GearZone để bắt đầu hành trình mua sắm gaming gear.',
}

export default function RegisterPage() {
  return <RegisterClient />
}
