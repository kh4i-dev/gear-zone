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

import { Button } from './Button'
import { MoneyInputVND } from './MoneyInputVND'

export { Input, Button, MoneyInputVND }

