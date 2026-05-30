import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input, type InputProps } from './ui'

const vndFormatter = new Intl.NumberFormat('vi-VN')

export interface MoneyInputVNDProps extends Omit<InputProps, 'onChange' | 'value' | 'type'> {
  value: number | null
  onChange: (val: number) => void
}

export const MoneyInputVND = ({ className, value, onChange, ...props }: MoneyInputVNDProps) => {
  const displayValue = value == null || value === 0 ? '' : vndFormatter.format(value)

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (!raw) {
      onChange(0)
      return
    }
    const digits = raw.replace(/\D/g, '')
    const parsed = digits ? parseInt(digits, 10) : 0
    onChange(parsed)
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleMoneyChange}
      endAdornment={<span className="text-sm font-medium select-none">đ</span>}
      className={cn("text-right", className)}
    />
  )
}
