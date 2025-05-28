import React from 'react'
import { cn } from '../../lib/utils'

const Label = React.forwardRef(({
  className,
  htmlFor,
  required = false,
  children,
  ...props
}, ref) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  )
})

Label.displayName = 'Label'

export { Label }