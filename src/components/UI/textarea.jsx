import React from 'react'
import { cn } from '../../lib/utils'

const Textarea = React.forwardRef(({
  className,
  error = false,
  ...props
}, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-primary-500',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

export { Textarea }