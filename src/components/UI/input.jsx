import React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({
  className,
  type = 'text',
  error = false,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'input',
        error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus-visible:ring-primary-500',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }