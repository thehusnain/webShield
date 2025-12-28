import { ReactNode } from 'react';

// Props interface
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

// Reusable card container
export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        card p-6
        ${hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
