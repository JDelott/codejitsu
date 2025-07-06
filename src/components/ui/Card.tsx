import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  isSelected = false 
}) => {
  const baseClasses = 'bg-white border rounded-lg transition-all duration-200';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-md' : '';
  const selectedClasses = isSelected ? 'border-black shadow-md' : 'border-gray-200';
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 
