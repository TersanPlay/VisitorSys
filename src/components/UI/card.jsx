import React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

const CardHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
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

CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }