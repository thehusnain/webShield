import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = '📋', title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      {action}
    </div>
  );
}
