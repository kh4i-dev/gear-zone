import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({ className, variant = 'default', size = 'default', isLoading, children, ref, ...props }: ButtonProps) {
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
