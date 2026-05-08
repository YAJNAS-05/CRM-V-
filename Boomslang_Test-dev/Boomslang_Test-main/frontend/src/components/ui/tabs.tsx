import React, { useState } from 'react';

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  children, 
  value, 
  className = '',
  ...props 
}) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    const onValueChange = (props as any).onValueChange;
    if (onValueChange) {
      onValueChange(value);
    }
  };
  
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        (props as any).value === value 
          ? 'border-blue-500 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  children, 
  value, 
  className = '',
  ...props 
}) => {
  if ((props as any).value !== value) {
    return null;
  }
  
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};
