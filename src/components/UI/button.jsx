import React from 'react'
import { cn } from '../../lib/utils'

const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'default',
  asChild = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? React.Children.only(children).type : 'button'

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 dark:hover:text-gray-50',
    link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
  }

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10'
  }

  return (
    <Comp
      className={cn(
        'btn',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {asChild ? children : children}
    </Comp>
  )
})

Button.displayName = 'Button'

export { Button }