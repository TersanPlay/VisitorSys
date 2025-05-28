import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

const AlertDialogContext = createContext({})

const AlertDialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false)

  const handleOpenChange = (value) => {
    setIsOpen(value)
    if (onOpenChange) onOpenChange(value)
  }

  return (
    <AlertDialogContext.Provider value={{ open: open !== undefined ? open : isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

const AlertDialogTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = useContext(AlertDialogContext)

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

AlertDialogTrigger.displayName = 'AlertDialogTrigger'

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open } = useContext(AlertDialogContext)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="fixed inset-0" />
      <div
        ref={ref}
        className={cn(
          'relative bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[85vh] overflow-auto p-6 dark:bg-gray-950',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})

AlertDialogContent.displayName = 'AlertDialogContent'

const AlertDialogHeader = React.forwardRef(({ className, children, ...props }, ref) => {
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

AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogTitle = React.forwardRef(({ className, children, ...props }, ref) => {
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

AlertDialogTitle.displayName = 'AlertDialogTitle'

const AlertDialogDescription = React.forwardRef(({ className, children, ...props }, ref) => {
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

AlertDialogDescription.displayName = 'AlertDialogDescription'

const AlertDialogFooter = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    >
      {children}
    </div>
  )
})

AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogAction = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = useContext(AlertDialogContext)

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary-600 text-white hover:bg-primary-700 h-10 py-2 px-4',
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
})

AlertDialogAction.displayName = 'AlertDialogAction'

const AlertDialogCancel = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onOpenChange } = useContext(AlertDialogContext)

  return (
    <button
      ref={ref}
      className={cn(
        'mt-2 sm:mt-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 hover:bg-gray-100 h-10 py-2 px-4',
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children || 'Cancelar'}
    </button>
  )
})

AlertDialogCancel.displayName = 'AlertDialogCancel'

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
}