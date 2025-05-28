import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const DialogContext = createContext({})

const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false)

  const handleOpenChange = (value) => {
    setIsOpen(value)
    if (onOpenChange) onOpenChange(value)
  }

  return (
    <DialogContext.Provider value={{ open: open !== undefined ? open : isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = useContext(DialogContext)

  return (
    <button
      type="button"
      ref={ref}
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
})

DialogTrigger.displayName = 'DialogTrigger'

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = useContext(DialogContext)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          'relative bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[85vh] overflow-auto p-6 dark:bg-gray-950',
          className
        )}
        {...props}
      >
        <button
          type="button"
          className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        {children}
      </div>
    </div>
  )
})

DialogContent.displayName = 'DialogContent'

const DialogHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    >
      {children}
    </div>
  )
})

DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
})

DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </p>
  )
})

DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }