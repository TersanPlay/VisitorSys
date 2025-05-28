import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
        />
        {text && (
          <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner