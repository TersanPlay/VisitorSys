import React from 'react'
import { cn } from '../../lib/utils'

const Table = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
})

Table.displayName = 'Table'

const TableHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('[&_tr]:border-b', className)}
      {...props}
    >
      {children}
    </thead>
  )
})

TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  )
})

TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <tfoot
      ref={ref}
      className={cn('bg-gray-50 font-medium dark:bg-gray-900', className)}
      {...props}
    >
      {children}
    </tfoot>
  )
})

TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 dark:hover:bg-gray-800/50 dark:data-[state=selected]:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
})

TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    >
      {children}
    </td>
  )
})

TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </caption>
  )
})

TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
}