import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
}

const INPUT_ADORNMENT_GAP = 'pl-11'

const Input = ({ 
  className, 
  label, 
  error, 
  hint, 
  startAdornment,
  endAdornment, 
  ref, 
  ...props 
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const id = React.useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-slate-300 mb-1.5">
          {label}{props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {startAdornment && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex items-center pointer-events-none z-10 [&_svg]:size-4">
            {startAdornment}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'flex h-11 w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 transition-colors duration-200',
            'border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            startAdornment && 'pl-11',
            endAdornment && 'pr-11',
            error && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex items-center z-10 [&_svg]:size-4">
            {endAdornment}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-400 font-medium">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-[12px] text-slate-500">{hint}</p>}
    </div>
  )
}
Input.displayName = 'Input'

import { Button } from './Button'
import { MoneyInputVND } from './MoneyInputVND'

export { Input, Button, MoneyInputVND }

