import React from 'react'
import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

const Checkbox = React.forwardRef(({
  className,
  checked,
  onCheckedChange,
  disabled = false,
  ...props
}, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 dark:border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800',
        className
      )}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      {checked && (
        <Check className="h-3 w-3 text-white" />
      )}
    </button>
  )
})

Checkbox.displayName = 'Checkbox'

export { Checkbox }