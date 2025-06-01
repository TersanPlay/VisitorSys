import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Check, ChevronRight } from 'lucide-react'

const DropdownMenuContext = createContext({})

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ className, asChild = false, children, ...props }, ref) => {
  const { open, setOpen } = useContext(DropdownMenuContext)
  const Comp = asChild ? React.Children.only(children).type : 'button'

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="true"
      {...props}
    >
      {children}
    </Comp>
  )
})

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuContent = React.forwardRef(({ className, align = 'center', children, ...props }, ref) => {
  const { open } = useContext(DropdownMenuContext)

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 dark:border-gray-800 dark:bg-gray-950',
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef(({ className, inset, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50',
        className
      )}
      role="menuitemcheckbox"
      aria-checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  )
})

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
})

DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800', className)}
      {...props}
    />
  )
})

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 data-[state=open]:bg-gray-100 dark:focus:bg-gray-800 dark:data-[state=open]:bg-gray-800',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  )
})

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger
}