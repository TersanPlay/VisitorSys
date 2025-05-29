import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

const SelectContext = createContext({})

const Select = ({ children, value, onValueChange, disabled = false }) => {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange, disabled }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, value, disabled } = useContext(SelectContext)

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setOpen(!open)}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})

SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = React.forwardRef(({ className, placeholder = 'Selecione...', ...props }, ref) => {
  const { value } = useContext(SelectContext)

  return (
    <span className={cn('flex-grow truncate', className)} ref={ref} {...props}>
      {value || placeholder}
    </span>
  )
})

SelectValue.displayName = 'SelectValue'

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useContext(SelectContext)

  if (!open) return null

  return (
    <div className="relative z-50">
      <div
        className="fixed inset-0"
        onClick={() => setOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          'absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})

SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef(({ className, children, value: itemValue, ...props }, ref) => {
  const { value, onValueChange, setOpen } = useContext(SelectContext)
  const isSelected = value === itemValue

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center py-1.5 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none hover:bg-gray-100 dark:hover:bg-gray-700',
        isSelected && 'bg-gray-100 dark:bg-gray-700 font-medium',
        className
      )}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
})

SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }