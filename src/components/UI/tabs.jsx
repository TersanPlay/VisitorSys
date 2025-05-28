import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext({})

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue)

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: value !== undefined ? value : selectedValue, onValueChange: handleValueChange }}>
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({
  className,
  value,
  children,
  disabled = false,
  ...props
}, ref) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-primary-700 shadow-sm dark:bg-gray-950 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})

TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(({
  className,
  value,
  children,
  ...props
}, ref) => {
  const { value: selectedValue } = useContext(TabsContext)
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2', className)}
      {...props}
    >
      {children}
    </div>
  )
})

TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }