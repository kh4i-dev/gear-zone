import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký | GearZone',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
