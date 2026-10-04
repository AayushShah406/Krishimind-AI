import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl border border-krishi-border shadow-subtle p-5 ${
        hoverable ? 'hover:shadow-card-hover hover:border-krishi-accent/40 cursor-pointer transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
