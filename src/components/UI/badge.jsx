import React from 'react'
import { cn } from '../../lib/utils'

const Badge = React.forwardRef(({
  className,
  variant = 'default',
  children,
  ...props
}, ref) => {
  const variantClasses = {
    default: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    outline: 'border border-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export { Badge }