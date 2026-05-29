import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  endAdornment?: React.ReactNode
}

const Input = ({ className, label, error, hint, endAdornment, ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const id = React.useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={cn(
            'flex h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500/50',
            endAdornment && 'pr-8',
            className
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
Input.displayName = 'Input'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

const Button = ({ className, variant = 'default', size = 'default', isLoading, children, ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  return (
    <button type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-500',
        variant === 'ghost' && 'hover:bg-white/5',
        size === 'default' && 'h-10 px-4 py-2 text-sm',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="mr-2 size-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
Button.displayName = 'Button'

export { Input, Button }

export interface MoneyInputVNDProps extends Omit<InputProps, 'onChange' | 'value' | 'type'> {
  value: number
  onChange: (val: number) => void
}

export const MoneyInputVND = ({ className, value, onChange, ...props }: MoneyInputVNDProps) => {
  const [displayValue, setDisplayValue] = React.useState(
    value === 0 ? '' : new Intl.NumberFormat('vi-VN').format(value)
  )

  React.useEffect(() => {
    const digits = displayValue.replace(/\\D/g, '')
    const currentParsed = digits ? parseInt(digits, 10) : 0
    if (currentParsed !== value) {
      setDisplayValue(value === 0 ? '' : new Intl.NumberFormat('vi-VN').format(value))
    }
  }, [value, displayValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (!raw) {
      setDisplayValue('')
      onChange(0)
      return
    }
    const digits = raw.replace(/\\D/g, '')
    const parsed = digits ? parseInt(digits, 10) : 0
    onChange(parsed)
    setDisplayValue(new Intl.NumberFormat('vi-VN').format(parsed))
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      endAdornment={<span className="text-sm font-medium select-none">đ</span>}
      className={cn("text-right", className)}
    />
  )
}
